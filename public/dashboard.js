async function fetchServerData() {
    console.log('Fetching server data...');
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('Server data received:', data);
        
        // Update server info
        document.getElementById('server-port').textContent = window.location.port || '5000';
        document.getElementById('server-uptime').textContent = formatUptime(data.uptime);
        document.getElementById('server-version').textContent = '1.0.0';
        
        // Update database status
        const dbStatus = data.database.status;
        const dbIndicator = document.getElementById('db-indicator');
        const dbStatusText = document.getElementById('db-status');
        
        if (dbStatus === 'connected') {
            dbIndicator.className = 'status-indicator status-connected';
            dbStatusText.textContent = 'Connected';
        } else {
            dbIndicator.className = 'status-indicator status-disconnected';
            dbStatusText.textContent = 'Disconnected';
        }
        
        // Update timestamp
        document.getElementById('last-updated').textContent = 
            `Last updated: ${new Date().toLocaleString()}`;
            
    } catch (error) {
        console.error('Error fetching server data:', error);
        document.getElementById('db-status').textContent = 'Error fetching status';
    }
}

function formatUptime(seconds) {
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

function refreshData() {
    console.log('Refresh button clicked!');
    fetchServerData();
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dashboard...');
    
    // Initial load
    fetchServerData();
    
    // Auto-refresh every 30 seconds
    setInterval(fetchServerData, 30000);
    
    // Ensure refresh button is working
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
        console.log('Refresh button event listener added');
    } else {
        console.error('Refresh button not found!');
    }
});
