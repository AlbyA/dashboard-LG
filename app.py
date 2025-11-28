import streamlit as st
import pandas as pd
import plotly.express as px
import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Lead Management Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .metric-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #1f77b4;
    }
    .stMetric {
        background-color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    </style>
""", unsafe_allow_html=True)

@st.cache_data(ttl=60)  # Cache for 60 seconds for live updates
def load_data_from_sheet():
    """Load data from Google Sheets"""
    try:
        # Try to use service account credentials
        if os.path.exists('credentials.json'):
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
                'https://www.googleapis.com/auth/drive.readonly'
            ]
            creds = Credentials.from_service_account_file('credentials.json', scopes=scopes)
            client = gspread.authorize(creds)
        else:
            # Fallback: try to use environment variables or OAuth
            st.error("⚠️ credentials.json not found. Please set up Google Sheets API credentials.")
            st.info("""
            **Setup Instructions:**
            1. Go to https://console.cloud.google.com/
            2. Create a new project or select existing one
            3. Enable Google Sheets API
            4. Create credentials (Service Account)
            5. Download the JSON key file
            6. Rename it to 'credentials.json' and place in the project root
            7. Share your Google Sheet with the service account email (found in credentials.json)
            """)
            return None
        
        sheet_id = os.getenv('GOOGLE_SHEET_ID', '1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc')
        sheet = client.open_by_key(sheet_id)
        worksheet = sheet.sheet1
        
        # Get all records
        records = worksheet.get_all_records()
        df = pd.DataFrame(records)
        
        # Clean and process the data
        if not df.empty:
            # Convert Date Generated to datetime
            if 'Date Generated' in df.columns:
                df['Date Generated'] = pd.to_datetime(df['Date Generated'], errors='coerce')
            
            # Convert Fit Score to numeric
            if 'Fit Score' in df.columns:
                df['Fit Score'] = pd.to_numeric(df['Fit Score'], errors='coerce')
            
            # Convert Experience to numeric
            if 'Experience (Years)' in df.columns:
                df['Experience (Years)'] = pd.to_numeric(df['Experience (Years)'], errors='coerce')
        
        return df
    except Exception as e:
        st.error(f"Error loading data: {str(e)}")
        return None

def calculate_kpis(df):
    """Calculate key performance indicators"""
    if df is None or df.empty:
        return {
            'total_with_fit_score': 0,
            'invited': 0,
            'accepted': 0
        }
    
    # Total leads with Fit Score
    total_with_fit_score = df['Fit Score'].notna().sum()
    
    # Invited leads (Connection Status = "Ready to send" or "Sent")
    invited = df['Connection Status'].isin(['Ready to send', 'Sent']).sum()
    
    # Accepted leads
    accepted = (df['Connection Status'] == 'ACCEPTED').sum()
    
    return {
        'total_with_fit_score': total_with_fit_score,
        'invited': invited,
        'accepted': accepted
    }

def main():
    st.title("📊 Lead Management Dashboard")
    st.markdown("---")
    
    # Auto-refresh button
    col1, col2 = st.columns([1, 10])
    with col1:
        if st.button("🔄 Refresh"):
            st.cache_data.clear()
            st.rerun()
    
    # Load data
    with st.spinner("Loading data from Google Sheets..."):
        df = load_data_from_sheet()
    
    if df is None or df.empty:
        st.warning("No data available. Please check your Google Sheets connection.")
        return
    
    # Display data info
    st.sidebar.markdown("### 📋 Data Info")
    st.sidebar.info(f"Total Records: {len(df)}")
    st.sidebar.info(f"Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Filters in sidebar
    st.sidebar.markdown("### 🔍 Filters")
    
    # Date range filter
    if 'Date Generated' in df.columns and df['Date Generated'].notna().any():
        min_date = df['Date Generated'].min().date()
        max_date = df['Date Generated'].max().date()
        date_range = st.sidebar.date_input(
            "Date Range",
            value=(min_date, max_date),
            min_value=min_date,
            max_value=max_date
        )
        
        if len(date_range) == 2:
            start_date, end_date = date_range
            df = df[(df['Date Generated'].dt.date >= start_date) & 
                   (df['Date Generated'].dt.date <= end_date)]
    else:
        st.sidebar.warning("Date Generated column not available")
    
    # Connection Status filter
    if 'Connection Status' in df.columns:
        connection_statuses = ['All'] + sorted(df['Connection Status'].dropna().unique().tolist())
        selected_status = st.sidebar.selectbox("Connection Status", connection_statuses)
        if selected_status != 'All':
            df = df[df['Connection Status'] == selected_status]
    
    # Fit Score range filter
    if 'Fit Score' in df.columns and df['Fit Score'].notna().any():
        min_score = float(df['Fit Score'].min())
        max_score = float(df['Fit Score'].max())
        fit_score_range = st.sidebar.slider(
            "Fit Score Range",
            min_value=min_score,
            max_value=max_score,
            value=(min_score, max_score)
        )
        df = df[(df['Fit Score'] >= fit_score_range[0]) & 
               (df['Fit Score'] <= fit_score_range[1])]
    
    # Calculate KPIs
    kpis = calculate_kpis(df)
    
    # Display KPI Cards
    st.markdown("### 📈 Key Performance Indicators")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(
            label="Total Leads (with Fit Score)",
            value=kpis['total_with_fit_score'],
            delta=None
        )
    
    with col2:
        st.metric(
            label="Invited Leads",
            value=kpis['invited'],
            delta=None
        )
    
    with col3:
        st.metric(
            label="Accepted Leads",
            value=kpis['accepted'],
            delta=None
        )
    
    st.markdown("---")
    
    # Connection Status Analysis
    st.markdown("### 🔗 Connection Status Analysis")
    
    if 'Connection Status' in df.columns and 'Date Generated' in df.columns:
        col1, col2 = st.columns(2)
        
        with col1:
            # Daily counts trend
            df_daily = df[df['Date Generated'].notna()].copy()
            if not df_daily.empty:
                df_daily['Date'] = df_daily['Date Generated'].dt.date
                daily_counts = df_daily.groupby(['Date', 'Connection Status']).size().reset_index(name='Count')
                
                fig_trend = px.line(
                    daily_counts,
                    x='Date',
                    y='Count',
                    color='Connection Status',
                    title='Connection Status Trends (Daily)',
                    markers=True
                )
                fig_trend.update_layout(
                    xaxis_title="Date",
                    yaxis_title="Count",
                    hovermode='x unified',
                    height=400
                )
                st.plotly_chart(fig_trend, use_container_width=True)
            else:
                st.info("No date data available for trend analysis")
        
        with col2:
            # Pie chart for distribution
            status_counts = df['Connection Status'].value_counts()
            if not status_counts.empty:
                fig_pie = px.pie(
                    values=status_counts.values,
                    names=status_counts.index,
                    title='Connection Status Distribution'
                )
                fig_pie.update_traces(textposition='inside', textinfo='percent+label')
                fig_pie.update_layout(height=400)
                st.plotly_chart(fig_pie, use_container_width=True)
            else:
                st.info("No connection status data available")
    else:
        st.warning("Connection Status or Date Generated columns not available")
    
    # Email Status Analysis
    st.markdown("### 📧 Email Status Analysis")
    
    email_columns = [
        'Notification Email Sent (on accepting invitation)',
        'Email Status 1',
        'Email Status 2'
    ]
    
    available_email_cols = [col for col in email_columns if col in df.columns]
    
    if available_email_cols:
        col1, col2 = st.columns(2)
        
        with col1:
            # Bar chart for email statuses
            email_data = []
            for col in available_email_cols:
                status_counts = df[col].value_counts()
                for status, count in status_counts.items():
                    email_data.append({
                        'Email Type': col,
                        'Status': status if pd.notna(status) else 'Not Set',
                        'Count': count
                    })
            
            if email_data:
                df_email = pd.DataFrame(email_data)
                fig_bar = px.bar(
                    df_email,
                    x='Email Type',
                    y='Count',
                    color='Status',
                    title='Email Status Distribution',
                    barmode='group'
                )
                fig_bar.update_layout(
                    xaxis_title="Email Type",
                    yaxis_title="Count",
                    height=400,
                    xaxis_tickangle=-45
                )
                st.plotly_chart(fig_bar, use_container_width=True)
        
        with col2:
            # Pie charts for each email status
            if len(available_email_cols) > 0:
                selected_email_col = st.selectbox("Select Email Status", available_email_cols)
                status_counts = df[selected_email_col].value_counts()
                if not status_counts.empty:
                    fig_pie_email = px.pie(
                        values=status_counts.values,
                        names=status_counts.index,
                        title=f'{selected_email_col} Distribution'
                    )
                    fig_pie_email.update_traces(textposition='inside', textinfo='percent+label')
                    fig_pie_email.update_layout(height=400)
                    st.plotly_chart(fig_pie_email, use_container_width=True)
    else:
        st.warning("Email status columns not available")
    
    # Fit Score Analysis
    st.markdown("### 🎯 Fit Score Analysis")
    
    if 'Fit Score' in df.columns:
        fit_scores = df['Fit Score'].dropna()
        
        if not fit_scores.empty:
            col1, col2 = st.columns(2)
            
            with col1:
                # Statistics
                st.markdown("#### Statistics")
                stats_data = {
                    'Metric': ['Average', 'Minimum', 'Maximum', 'Median', 'Standard Deviation'],
                    'Value': [
                        round(fit_scores.mean(), 2),
                        round(fit_scores.min(), 2),
                        round(fit_scores.max(), 2),
                        round(fit_scores.median(), 2),
                        round(fit_scores.std(), 2)
                    ]
                }
                stats_df = pd.DataFrame(stats_data)
                st.dataframe(stats_df, use_container_width=True, hide_index=True)
            
            with col2:
                # Histogram
                fig_hist = px.histogram(
                    fit_scores,
                    nbins=30,
                    title='Fit Score Distribution',
                    labels={'value': 'Fit Score', 'count': 'Frequency'}
                )
                fig_hist.update_layout(height=400)
                st.plotly_chart(fig_hist, use_container_width=True)
            
            # Box plot
            st.markdown("#### Fit Score Box Plot")
            fig_box = px.box(
                df,
                y='Fit Score',
                title='Fit Score Distribution (Box Plot)'
            )
            fig_box.update_layout(height=300)
            st.plotly_chart(fig_box, use_container_width=True)
        else:
            st.warning("No Fit Score data available")
    else:
        st.warning("Fit Score column not available")
    
    # Additional Insights
    st.markdown("### 💡 Additional Insights")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if 'Current Employer' in df.columns:
            st.markdown("#### Top Employers")
            top_employers = df['Current Employer'].value_counts().head(10)
            if not top_employers.empty:
                fig_employers = px.bar(
                    x=top_employers.values,
                    y=top_employers.index,
                    orientation='h',
                    title='Top 10 Current Employers',
                    labels={'x': 'Count', 'y': 'Employer'}
                )
                fig_employers.update_layout(height=400)
                st.plotly_chart(fig_employers, use_container_width=True)
    
    with col2:
        if 'Location' in df.columns:
            st.markdown("#### Top Locations")
            top_locations = df['Location'].value_counts().head(10)
            if not top_locations.empty:
                fig_locations = px.bar(
                    x=top_locations.values,
                    y=top_locations.index,
                    orientation='h',
                    title='Top 10 Locations',
                    labels={'x': 'Count', 'y': 'Location'}
                )
                fig_locations.update_layout(height=400)
                st.plotly_chart(fig_locations, use_container_width=True)
    
    # Auto-refresh info
    st.sidebar.markdown("---")
    st.sidebar.info("💡 Data refreshes automatically every 60 seconds. Click 'Refresh' to update manually.")

if __name__ == "__main__":
    main()

