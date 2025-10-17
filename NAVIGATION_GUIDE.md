# Stock Pail - Navigation Guide

## 📍 Location of Generated Features

### **Forms**
- **Location**: `/` (Dashboard/Index page)
- **Component**: `src/components/StockEntry.tsx`
- **Features**: Add new stock items with batch number, stock number, description, and quantity

### **Reports & Charts**  
- **Location**: `/analytics`
- **File**: `src/pages/Analytics.tsx`
- **Features**:
  - Total Items & Quantity metrics
  - Stock diversity charts
  - Top Stock Numbers (sorted by quantity)
  - Top Batches (most frequently used)
  - Low stock & out-of-stock alerts
  - CSV import for bulk data

### **Lists & Tables**
- **Location**: `/` (Dashboard/Index page)
- **Components**: 
  - `src/components/StockTable.tsx` - Main inventory table
  - `src/components/GroupedStockView.tsx` - Grouped view by stock/batch
  - `src/components/StockOverview.tsx` - Summary cards
- **Features**:
  - Sortable columns (batch, stock, quantity, date)
  - Search filtering
  - List view vs Grouped view toggle
  - Group by Stock Number or Batch Number
  - Edit/Delete actions

### **Form Builder & Report Generator**
- **Location**: `/presentation`
- **File**: `src/pages/Presentation.tsx`
- **Features**:
  - Create custom forms (Excel, PDF, Web Form)
  - Generate reports with scheduling
  - Manage existing forms and reports

### **Document Management**
- **Location**: `/documents`
- **File**: `src/pages/Documents.tsx`
- **Components**:
  - `src/components/DocumentUpload.tsx` - Upload documents
  - `src/components/DocumentList.tsx` - View and manage documents
  - `src/components/DataImportExport.tsx` - Import/Export data
- **Features**:
  - Upload PDFs, Excel, CSV, and images (up to 50MB)
  - Automatic document parsing for CSV files
  - Search and filter documents by category
  - Download documents
  - Delete documents
  - Import stock data from CSV
  - Export stock data to CSV or JSON

## 🗺️ Route Map
- `/` - Main Dashboard (Forms + Lists)
- `/home` - Home page
- `/analytics` - Analytics Dashboard (Charts + Reports)
- `/presentation` - Form Builder & Report Generator
- `/documents` - Document Management System
