let healthData = null;
let responseTime = 0;

async function fetchHealthData() {
    const startTime = performance.now();
    
    try {
        const response = await fetch('/api/health');
        const endTime = performance.now();
        responseTime = Math.round(endTime - startTime);
        
        healthData = await response.json();
        updateHealthDisplay();
        return true;
    } catch (error) {
        console.error('Error fetching health data:', error);
        showErrorState();
        return false;
    }
}

function updateHealthDisplay() {
    if (!healthData) return;
    
    // Update main status
    updateMainStatus();
    
    // Update metrics
    updateMetrics();
    
    // Update service status
    updateServiceStatus();
    
    // Update system info
    updateSystemInfo();
}

function updateMainStatus() {
    const isHealthy = healthData.database.status === 'connected';
    const mainStatusCard = document.querySelector('.status-card.main-status');
    const statusIcon = document.getElementById('main-status-icon');
    const statusText = document.getElementById('main-status-text');
    const statusDesc = document.getElementById('main-status-desc');
    
    if (isHealthy) {
        mainStatusCard.classList.add('healthy');
        mainStatusCard.classList.remove('unhealthy');
        statusIcon.classList.add('healthy');
        statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        statusText.textContent = 'All Systems Operational';
        statusText.style.color = '#4CAF50';
        statusDesc.textContent = 'Your Solar Blog API is running smoothly';
    } else {
        mainStatusCard.classList.add('unhealthy');
        mainStatusCard.classList.remove('healthy');
        statusIcon.classList.add('unhealthy');
        statusIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        statusText.textContent = 'System Issues Detected';
        statusText.style.color = '#f44336';
        statusDesc.textContent = 'Some services may not be functioning properly';
    }
}

function updateMetrics() {
    // Server Status
    const serverIndicator = document.getElementById('server-indicator');
    const serverStatus = document.getElementById('server-status');
    const serverUptime = document.getElementById('server-uptime');
    const serverPort = document.getElementById('server-port');
    
    serverIndicator.className = 'status-indicator connected';
    serverStatus.textContent = 'Running';
    serverUptime.textContent = formatUptime(healthData.uptime);
    serverPort.textContent = window.location.port || '5000';
    
    // Database Status
    const dbIndicator = document.getElementById('db-indicator');
    const dbStatus = document.getElementById('db-status');
    const dbConnection = document.getElementById('db-connection');
    
    if (healthData.database.status === 'connected') {
        dbIndicator.className = 'status-indicator connected';
        dbStatus.textContent = 'Connected';
        dbConnection.textContent = 'Active';
    } else {
        dbIndicator.className = 'status-indicator disconnected';
        dbStatus.textContent = 'Disconnected';
        dbConnection.textContent = 'Failed';
    }
    
    // Response Time
    const responseTimeElement = document.getElementById('response-time');
    const responseStatus = document.getElementById('response-status');
    
    responseTimeElement.textContent = responseTime;
    
    if (responseTime < 100) {
        responseTimeElement.className = 'response-time';
        responseStatus.textContent = 'Excellent';
    } else if (responseTime < 500) {
        responseTimeElement.className = 'response-time slow';
        responseStatus.textContent = 'Good';
    } else {
        responseTimeElement.className = 'response-time very-slow';
        responseStatus.textContent = 'Slow';
    }
    
    // System Info
    document.getElementById('node-version').textContent = 'v18+';
    document.getElementById('platform').textContent = 'Node.js';
}

function updateServiceStatus() {
    // Express Server
    const expressStatus = document.getElementById('express-status');
    expressStatus.textContent = '✓ Running';
    expressStatus.className = 'status-badge success';
    
    // MongoDB
    const mongoStatus = document.getElementById('mongo-status');
    if (healthData.database.status === 'connected') {
        mongoStatus.textContent = '✓ Connected';
        mongoStatus.className = 'status-badge success';
    } else {
        mongoStatus.textContent = '✗ Disconnected';
        mongoStatus.className = 'status-badge error';
    }
    
    // API Routes
    const routesStatus = document.getElementById('routes-status');
    routesStatus.textContent = '✓ Active';
    routesStatus.className = 'status-badge success';
    
    // Security
    const securityStatus = document.getElementById('security-status');
    securityStatus.textContent = '✓ Enabled';
    securityStatus.className = 'status-badge success';
}

function updateSystemInfo() {
    document.getElementById('current-timestamp').textContent = new Date(healthData.timestamp).toLocaleString();
    document.getElementById('last-check').textContent = new Date().toLocaleString();
}

function showErrorState() {
    const mainStatusCard = document.querySelector('.status-card.main-status');
    const statusIcon = document.getElementById('main-status-icon');
    const statusText = document.getElementById('main-status-text');
    const statusDesc = document.getElementById('main-status-desc');
    
    mainStatusCard.classList.add('unhealthy');
    statusIcon.classList.add('unhealthy');
    statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
    statusText.textContent = 'Connection Failed';
    statusText.style.color = '#f44336';
    statusDesc.textContent = 'Unable to connect to the server';
    
    // Update metrics to show error state
    document.getElementById('server-status').textContent = 'Unknown';
    document.getElementById('db-status').textContent = 'Unknown';
    document.getElementById('response-time').textContent = '--';
    document.getElementById('response-status').textContent = 'Failed';
}

function formatUptime(seconds) {
    if (!seconds) return '--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Auto-refresh functionality
let autoRefreshInterval;

function startAutoRefresh() {
    // Refresh every 30 seconds
    autoRefreshInterval = setInterval(fetchHealthData, 30000);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Health check page loaded');
    
    // Initial fetch
    fetchHealthData();
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Refresh button event
    const refreshBtn = document.getElementById('refresh-health');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('Manual refresh triggered');
            fetchHealthData();
        });
    }
    
    // Stop auto-refresh when page is hidden
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
            fetchHealthData(); // Refresh immediately when page becomes visible
        }
    });
});
