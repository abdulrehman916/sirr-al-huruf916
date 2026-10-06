# User Access Manager - Location & Features

## 📍 **Exact Location**

### **Page URL:**
```
/admin/user-management
```

### **Menu Path:**
**Admin Dashboard → User Access Manager**

### **How to Access:**

1. **From Admin Dashboard** (`/admin/dashboard`):
   - Look at the **sidebar navigation** (left side)
   - Click **"User Access Manager"** (first item in the list)
   - OR click the **"User Access Manager"** quick access card in the main content area

2. **Direct Navigation:**
   ```
   https://your-app.com/admin/user-management
   ```

---

## ✅ **Features Implemented**

### **🔍 Search Users**
Search by:
- **Mobile Number** - Partial match
- **Email** - Partial match  
- **Name** - Partial match
- **All Fields** - Search across all fields

### **📊 Status Filters**
Filter users by subscription status:
- **All Users** - Show everyone
- **Active** - Users with active subscriptions
- **Expired** - Users with expired subscriptions
- **Lifetime** - Users with lifetime access

### **🎁 Grant Manual Access**
- **Visible "Grant Access" button** on every user card
- Click to open modal
- Select duration (30 days, 6 months, 1 year, lifetime)
- Select pages (individual or all)
- Instant activation - no payment required

### **📋 Manage Subscriptions**
For each user's subscriptions:
- **Extend** - +30 days or +90 days
- **Revoke** - Cancel access immediately
- View details (page, plan, expiry, amount paid)

### **📊 Dashboard Stats**
- Total Users
- Active Subscriptions
- Pending Subscriptions
- Expired Subscriptions

---

## 🎯 **User Interface**

### **Header:**
```
User Access Manager
Grant manual access, search users, manage subscriptions
```

### **Search Section:**
- Search bar with type selector (Mobile/Email/Name/All)
- Status filter buttons (All/Active/Expired/Lifetime)
- Results count display

### **User Cards:**
Each user card shows:
- **Name/Email/Mobile** - User identification
- **Joined Date** - Registration date
- **Grant Access Button** - Gold button (top right)
- **Subscriptions List** - All user's subscriptions

### **Subscription Details:**
For each subscription:
- Page name
- Plan type (1 Month, 6 Months, 1 Year, Lifetime)
- Amount paid (₹0 for manual grants)
- Status badge (Active/Expired/Pending/Cancelled)
- Expiry date or "Lifetime Access"
- Action buttons (Extend +30d, Extend +90d, Revoke)

---

## 🚀 **Quick Start Guide**

### **Grant Manual Access:**
1. Go to `/admin/user-management`
2. Search for user (by mobile, email, or name)
3. Click **"Grant Access"** button on user card
4. Select duration (30 Days, 6 Months, 1 Year, Lifetime)
5. Select pages (check individual pages or "Select All")
6. Click **"Grant Access"** to confirm
7. User gets instant access - no payment required

### **Extend Subscription:**
1. Find user via search or filters
2. Locate the subscription in user's card
3. Click **"+30 Days"** or **"+90 Days"**
4. Expiry date updates automatically

### **Revoke Access:**
1. Find user via search or filters
2. Locate the subscription in user's card
3. Click **"Revoke"** button
4. Access cancelled immediately

### **Filter by Status:**
1. Click **"Active"** - See users with active subscriptions
2. Click **"Expired"** - See users with expired subscriptions
3. Click **"Lifetime"** - See users with lifetime access
4. Click **"All Users"** - Reset to show everyone

---

## 📱 **Navigation Structure**

```
Admin Dashboard (/admin/dashboard)
│
├─ User Access Manager ← MAIN MANUAL ACCESS PAGE
│  (/admin/user-management)
│  ├─ Search users (mobile/email/name)
│  ├─ Filter by status (active/expired/lifetime)
│  ├─ Grant manual access (no payment)
│  ├─ Extend subscriptions
│  └─ Revoke access
│
├─ Page Permissions
│  (/admin/page-permissions)
│  └─ Toggle PUBLIC/PRIVATE for pages
│
├─ Global Subscriptions
│  (/admin/subscriptions)
│  └─ Manage global subscription plans
│
├─ Page Subscriptions
│  (/admin/page-subscriptions)
│  └─ Manage page-specific subscriptions
│
├─ Pricing Settings
│  (/admin/pricing-settings)
│  └─ Set custom prices per page
│
└─ Subscriptions
   (/admin/subscriptions-management)
   └─ Approve & manage subscriptions
```

---

## 🔐 **Access Control**

### **Who Can Access:**
- **Admin role only** (`role: "admin"`)
- Authentication required via `base44.auth.me()`
- Redirects to home if not admin

### **Security:**
- Admin verification on page load
- Toast notification for unauthorized access
- Protected route via ProtectedPage component

---

## 📊 **Data Sources**

### **Entities Used:**
1. **UserAccessProfile** - User profiles with mobile/email
2. **Subscription** - All subscriptions (paid + manual)
3. **PagePermission** - Manual access permissions

### **Backend Functions:**
1. **grantManualAccess** - Grant access without payment
2. **extendPermissionExpiry** - Extend existing permissions
3. **revokePagePermission** - Revoke access

---

## 🎨 **UI Components**

### **Search & Filters:**
- Search input with icon
- Dropdown for search type (Mobile/Email/Name/All)
- Filter buttons with color coding:
  - All Users: Gold
  - Active: Green
  - Expired: Red
  - Lifetime: Purple

### **Grant Access Button:**
- **Color:** Gold background, dark text
- **Icon:** Gift icon
- **Position:** Top right of user card
- **Action:** Opens GrantAccessModal

### **User Card:**
- **Background:** Semi-transparent white/5
- **Border:** White/10
- **Layout:** CardHeader + CardContent
- **Responsive:** Mobile-friendly

### **Modal:**
- **Title:** "Grant Manual Access"
- **User Info:** Shows selected user details
- **Duration Selector:** Dropdown (30d/6m/1y/lifetime)
- **Page Selection:** Checkboxes with "Select All" option
- **Summary:** Shows selected pages count + duration

---

## 📝 **Key Features Summary**

✅ **Single Menu Item** - "User Access Manager"  
✅ **Clear Route** - `/admin/user-management`  
✅ **Visible Grant Access Button** - Gold button on every user  
✅ **Search by Mobile** - Partial match  
✅ **Search by Email** - Partial match  
✅ **Search by Name** - Partial match  
✅ **Filter: Active** - Users with active subscriptions  
✅ **Filter: Expired** - Users with expired subscriptions  
✅ **Filter: Lifetime** - Users with lifetime access  
✅ **Manual Access** - No payment required  
✅ **Extend Access** - +30 days or +90 days  
✅ **Revoke Access** - Cancel immediately  
✅ **Real-time Filtering** - Instant search results  
✅ **Results Counter** - Shows matching user count  

---

**Status:** ✅ Production Ready  
**Route:** `/admin/user-management`  
**Menu Name:** "User Access Manager"  
**Last Updated:** 2026-06-15