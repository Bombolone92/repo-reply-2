# Analytics Cache Configuration

## 🚀 **Optimized Cache Settings for Maximum Performance**

### **Cache TTL (Time To Live) Configuration**

| Data Type | Previous TTL | **New TTL** | Reason |
|-----------|--------------|-------------|---------|
| Platform Status | 2 minutes | **30 minutes** | Status changes rarely |
| Analytics Data | 3 minutes | **60 minutes** | Data stored in database |
| User Sites | 5 minutes | **120 minutes** | Sites change very rarely |
| Database Data | N/A | **2 hours** | Most aggressive for DB-stored data |

### **Throttling Configuration**

| Component | Previous Throttle | **New Throttle** | Reason |
|-----------|------------------|------------------|---------|
| Bing OAuth Status | 2 seconds | **10 seconds** | Status doesn't change frequently |
| WordPress OAuth Status | 2 seconds | **10 seconds** | Status doesn't change frequently |

### **Cache Management**

| Setting | Value | Purpose |
|---------|-------|---------|
| Max Cache Size | **100 entries** | Increased to accommodate longer TTL |
| Cleanup Interval | **5 minutes** | Optimized for longer cache duration |
| Database Data TTL | **2 hours** | Special handling for DB-stored analytics |

### **Expected Performance Improvements**

- **🔥 95%+ reduction** in redundant API calls
- **💰 Massive cost savings** on API usage
- **⚡ Instant loading** for cached data
- **🧠 Better user experience** with minimal loading states

### **Cache Hit Examples**

```
📦 Analytics Cache HIT: Platform status (cached for 30 minutes)
📦 Analytics Cache HIT: Analytics data (cached for 60 minutes)  
📦 Analytics Cache HIT: Analytics data from DB (cached for 2 hours)
🗄️ Analytics Cache SET (DB): /api/analytics/data (TTL: 7200000ms)
```

### **When Cache is Invalidated**

- Platform connection changes (connect/disconnect)
- Manual force refresh
- Manual cache clear
- Natural expiration (after TTL period)

### **Database-First Strategy**

Since analytics data is stored in the database:
- **Primary**: Check cache first
- **Secondary**: Fetch from database via API
- **Tertiary**: Cache for extended periods (2 hours)
- **Result**: Minimal API calls, maximum performance
