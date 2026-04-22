# 📖 OSHO Transport TMS - Complete User Manual

## 🔐 Login & Access

### Login Credentials
```
Username: rishabh
Password: Rishabh5689
```

### Auto-Login Feature
- Once logged in, your session is saved
- Close the browser → Session persists
- Reopen the browser → You're still logged in
- Login on any device with same credentials

---

## 📊 Dashboard

**Path:** Home page after login

### Features
- 📈 Overview of system statistics
- 🎯 Quick access to main operations
- 📋 Recent activity summary
- ⚡ Navigation to other pages

### Actions
- View summary statistics
- Navigate to Bookings, Clients, Payments
- Access Settings and Reports

---

## 👥 Clients Page

**Navigation:** Click "Clients" in sidebar

### Features
- ➕ Add new clients
- 📝 Edit existing clients
- 🗑️ Delete clients
- 🔍 Search clients
- 📋 View all client information

### Client Information
- **Name** - Company/Person name
- **GST** - Tax identification number
- **Phone** - Contact number
- **Address** - Business address
- **City** - City name

### How to Add Client
1. Click "Add Client" button
2. Fill in all fields
3. Click "Save"
4. Client appears in the list

### How to Edit Client
1. Click "Edit" button on client row
2. Modify information
3. Click "Save"

### How to Delete Client
1. Click "Delete" button on client row
2. Confirm deletion

---

## 📦 Bookings Page

**Navigation:** Click "Bookings" in sidebar

### Features
- ➕ Create new bookings
- 📝 Edit existing bookings
- 🗑️ Delete bookings
- 🔍 Search by way-bill number
- 📊 Filter by status
- 🎯 Quick actions

### Booking Information
- **Way Bill Number** - Auto-generated (OSHO-1001, OSHO-1002, etc.)
- **Booking Date** - Date of booking
- **Origin** - Starting location
- **Destination** - Ending location
- **Consignor** - Sender details
- **Consignee** - Receiver details
- **Material** - Type of goods
- **Packages** - Number of packages
- **Weight** - Actual and charge weight
- **Charges** - Freight, hamali, docket, etc.
- **Status** - pending, in_transit, delivered
- **Payment Status** - unpaid, partial, paid

### How to Create Booking
1. Click "New Booking" button
2. Fill in booking details
3. Select or search for consignor (sender)
4. Select or search for consignee (receiver)
5. Enter shipment details (material, packages, weight)
6. Configure charges (automatically calculated)
7. Click "Create Booking"
8. Way bill number is auto-generated

### How to Edit Booking
1. Click "Edit" button on booking row
2. Modify details
3. Click "Save"

### How to Update Status
1. Click "Edit" on booking
2. Change status dropdown (pending → in_transit → delivered)
3. Click "Save"

### How to Delete Booking
1. Click "Delete" button
2. Confirm deletion
3. Associated payments are also deleted

---

## 💳 Payments Page

**Navigation:** Click "Payments" in sidebar

### Features
- ➕ Record new payments
- 📝 Edit payment records
- 🗑️ Delete payments
- 🔍 Search by booking or client
- 💰 Track payment status
- 📊 View payment statistics

### Payment Information
- **Booking** - Which booking this payment is for
- **Client Name** - Who made the payment
- **Amount** - Payment amount
- **Payment Date** - When payment was made
- **Payment Mode** - cash, cheque, bank transfer, etc.
- **Notes** - Additional notes

### How to Record Payment
1. Click "Add Payment" button
2. Select booking (auto-shows way-bill number)
3. Enter payment amount
4. Select payment mode
5. Enter notes (optional)
6. Click "Save"

### Automatic Payment Status Update
- When you record payment:
  - If amount = total freight → Status becomes "paid" ✅
  - If amount < total freight → Status becomes "partial" ⚠️
  - If no payment → Status remains "unpaid" ❌

### How to Edit Payment
1. Click "Edit" button on payment row
2. Modify amount or details
3. Click "Save"
4. Booking payment status updates automatically

### How to Delete Payment
1. Click "Delete" button
2. Confirm deletion
3. Booking status recalculates

---

## 📄 Invoice Page

**Navigation:** Click "Invoice" in sidebar

### Features
- 🔍 Search bookings
- 📋 View booking details
- 🖨️ Generate PDF invoice
- ✉️ Print-ready format
- 🎨 Professional invoice template

### How to Generate Invoice
1. Click "Invoice" in sidebar
2. Search for booking by way-bill number
3. Click on booking in results
4. Review invoice details
5. Click "Download PDF" or "Print"
6. Invoice downloads/prints with:
   - Company details
   - Booking information
   - Consignor and Consignee details
   - Charges breakdown
   - Amount due

### Invoice Includes
- Company name and GST
- Booking details
- Consignor (sender) full information
- Consignee (receiver) full information
- Material and package details
- Itemized charges
- Total amount
- Payment terms
- Date and way-bill number

---

## 📊 Reports Page

**Navigation:** Click "Reports" in sidebar

### Features
- 📈 View various analytics
- 📊 Generate reports
- 💡 Business insights
- 📉 Trend analysis

### Reports Available
- Total bookings statistics
- Revenue summary
- Payment status breakdown
- Client performance
- Monthly trends
- Top routes
- Delivery status

### How to View Reports
1. Click "Reports" in sidebar
2. Select report type
3. View charts and statistics
4. Export/Print if needed

---

## 💬 Quotation Page

**Navigation:** Click "Quotation" in sidebar

### Features
- ✍️ Create quotations for clients
- 📧 Quote templates
- 💰 Price calculation
- 📄 Professional format
- 📤 Export and email

### How to Create Quotation
1. Click "Quotation" in sidebar
2. Enter client details (or search existing client)
3. Add line items:
   - Service description
   - Quantity
   - Rate
   - Total
4. Review total amount
5. Click "Generate" or "Send"

---

## ⚙️ Settings Page

**Navigation:** Click "Settings" in sidebar

### Company Information
- **Company Name** - Default: OSHO Transport Chhattisgarh
- **Address** - Company address
- **City** - City name
- **State** - State name
- **Phone** - Primary contact
- **Phone 2** - Secondary contact
- **GST Number** - Company GST

### Way-Bill Configuration
- **Prefix** - Way-bill number prefix (default: OSHO-)
- **Starting Number** - First way-bill number (default: 1001)
- **Next Way-Bill** - Auto-increments

### Default Charges
- **Default Freight** - Base freight charge
- **Default Hamali** - Loading/unloading charge
- **Default Docket** - Documentation charge

### Business Terms
- **Payment Terms** - Default terms displayed on invoices
- Editable text field
- Appears on all generated documents

### How to Update Settings
1. Click "Settings" in sidebar
2. Modify desired fields
3. Click "Save Settings"
4. Changes apply to all new bookings and invoices

---

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click "New" button | Create new item |
| Edit button | Modify item |
| Delete button | Remove item |
| Search box | Find item |
| Sidebar links | Navigate to pages |

---

## 📱 Mobile/Tablet Access

### Multi-Device Usage
1. On Desktop:
   - http://localhost:5173
   - Login and use normally

2. On Phone/Tablet:
   - Find computer IP: type in command prompt → `ipconfig`
   - Use IP address: http://192.168.x.x:5173
   - Login with same credentials
   - All data syncs instantly!

### Mobile Features
- ✅ Full functionality on mobile
- ✅ Touch-friendly interface
- ✅ Responsive design
- ✅ Same data as desktop
- ✅ Add bookings on phone
- ✅ Record payments on phone
- ✅ View invoices on phone

---

## 💾 Data Management

### Backup Your Data
1. Server data stored in `server-data.json`
2. Regular backups recommended:
   - Copy `server-data.json` to cloud storage
   - Keep external backup drive
   - Backup before major updates

### Import/Export
- **Export:** Download server-data.json file
- **Backup:** Keep secure copy
- **Restore:** Replace server-data.json and restart server

### Data Safety
- All data syncs to server
- Changes persist across sessions
- Deleted items are permanent
- Backups protect against loss

---

## 🐛 Common Tasks

### Add a Booking & Payment
1. Click "Bookings"
2. Click "New Booking"
3. Fill all details and save
4. Go to "Payments"
5. Click "Add Payment"
6. Select the booking
7. Enter amount and save
8. Booking status updates automatically

### Generate Invoice
1. Go to "Invoice"
2. Search booking by way-bill number
3. Click on booking
4. Review invoice
5. Click "Download PDF"
6. Open and print if needed

### Track Multiple Bookings
1. Go to "Bookings"
2. View list of all bookings
3. See way-bill numbers, dates, statuses
4. Click any booking for details
5. Can edit or delete from list

### Manage Clients
1. Go to "Clients"
2. View all clients
3. Add new: Click "Add Client"
4. Edit: Click "Edit" button
5. Delete: Click "Delete" button
6. Clients appear in booking selection

### Check Payment Status
1. Go to "Bookings"
2. View "Payment Status" column
3. See: unpaid, partial, or paid
4. Click booking to see details
5. Go to "Payments" to add more

---

## ✅ Best Practices

### For Booking Management
- ✅ Always set correct origin/destination
- ✅ Verify consignor and consignee details
- ✅ Update status as goods move
- ✅ Record all payments immediately
- ✅ Generate invoices for clients

### For Client Management
- ✅ Verify GST number
- ✅ Keep phone numbers updated
- ✅ Maintain accurate addresses
- ✅ Remove inactive clients

### For Payment Tracking
- ✅ Record payments on same day
- ✅ Keep notes for reference
- ✅ Follow up on unpaid bookings
- ✅ Generate payment reports

### For System Management
- ✅ Regular data backups
- ✅ Update settings periodically
- ✅ Review reports monthly
- ✅ Keep credentials secure

---

## 🚪 Logout

### How to Logout
1. Click on username/profile icon (top right)
2. Click "Logout"
3. You're logged out and returned to login page
4. To login again, use same credentials

### Auto-Logout
- Currently: Manual logout only
- Session persists until logout
- Close browser: Session stays active
- Open browser: Auto-login possible

---

## 🆘 Troubleshooting

### Can't Login
- Check username: `rishabh` (case-insensitive)
- Check password: `Rishabh5689` (case-sensitive)
- Ensure backend server is running

### Data Not Showing
- Refresh the page (F5 or Ctrl+R)
- Logout and login again
- Check if backend is running

### Can't Add New Item
- Fill all required fields
- Check for error messages
- Ensure you're logged in
- Try refreshing page

### Mobile Access Issues
- Use correct IP address
- Both devices on same WiFi
- Clear browser cache
- Check firewall settings

---

## 📞 Support & Help

### Need Assistance?
1. Check this manual first
2. Review error messages in browser
3. Check console (F12 Developer Tools)
4. Check server logs (if backend running)
5. Restart app if needed

### Browser Compatibility
- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

---

## 📝 Version & Credits

- **System:** OSHO Transport Management System (TMS)
- **Version:** 2.0 (Multi-Device)
- **Built with:** React, TypeScript, Express.js, Vite
- **Data Sync:** ✅ Multi-device support enabled
- **Latest Update:** April 2024

---

**You now have complete access to all pages and features!** ✨

All data syncs across devices with the same login → **Enjoy!** 🎉
