import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStocks } from "@/hooks/useStocks";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Calendar,
  Database,
  Package
} from "lucide-react";

type TimePeriod = 'week' | '2weeks' | 'month';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa', '#f472b6'];

const Analytics = () => {
  const { stocks, loading } = useStocks();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  // Calculate date cutoff based on selected period
  const getDateCutoff = () => {
    const now = new Date();
    switch (timePeriod) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '2weeks':
        return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  // Filter stocks by time period
  const filteredStocks = useMemo(() => {
    const cutoff = getDateCutoff();
    return stocks.filter(s => new Date(s.dateAdded) >= cutoff);
  }, [stocks, timePeriod]);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!filteredStocks.length) {
      return {
        totalItems: 0,
        totalQuantity: 0,
        uniqueStockNumbers: 0,
        uniqueBatchNumbers: 0,
        stockByType: [],
        batchDistribution: [],
        quantityStatus: [],
        statusDistribution: [],
        stockTypeData: [],
        statusCounts: { available: 0, pending: 0, shipped: 0, missing: 0, contaminated: 0 },
      };
    }

    // Stock by type (stock number) - for bar chart
    const stockByType = Object.entries(
      filteredStocks.reduce((acc, stock) => {
        acc[stock.stockNumber] = (acc[stock.stockNumber] || 0) + stock.quantity;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Batch distribution - for bar chart
    const batchDistribution = Object.entries(
      filteredStocks.reduce((acc, stock) => {
        acc[stock.batchNumber] = (acc[stock.batchNumber] || 0) + stock.quantity;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Status distribution for pie chart
    const totalQuantity = filteredStocks.reduce((sum, s) => sum + s.quantity, 0);
    
    const statusCounts = {
      available: filteredStocks.filter(s => s.status === 'available').length,
      pending: filteredStocks.filter(s => s.status === 'pending').length,
      shipped: filteredStocks.filter(s => s.status === 'shipped').length,
      missing: filteredStocks.filter(s => s.status === 'missing').length,
      contaminated: filteredStocks.filter(s => s.status === 'contaminated').length,
    };

    const statusDistribution = [
      { name: 'Available', value: statusCounts.available },
      { name: 'Pending', value: statusCounts.pending },
      { name: 'Shipped', value: statusCounts.shipped },
      { name: 'Missing', value: statusCounts.missing },
      { name: 'Contaminated', value: statusCounts.contaminated },
    ].filter(item => item.value > 0);

    const quantityStatus = [
      { name: 'Available (>10)', value: filteredStocks.filter(s => s.quantity > 10).reduce((sum, s) => sum + s.quantity, 0) },
      { name: 'Low Stock (1-10)', value: filteredStocks.filter(s => s.quantity > 0 && s.quantity <= 10).reduce((sum, s) => sum + s.quantity, 0) },
      { name: 'Out of Stock', value: filteredStocks.filter(s => s.quantity === 0).length },
    ].filter(item => item.value > 0);

    // Stock type distribution for pie chart
    const uniqueStockTypes = new Set(filteredStocks.map(s => s.stockNumber));
    const stockTypeData = Array.from(uniqueStockTypes).map(stockNumber => ({
      name: stockNumber,
      value: filteredStocks.filter(s => s.stockNumber === stockNumber).length
    })).slice(0, 8);

    return {
      totalItems: filteredStocks.length,
      totalQuantity,
      uniqueStockNumbers: uniqueStockTypes.size,
      uniqueBatchNumbers: new Set(filteredStocks.map(s => s.batchNumber)).size,
      stockByType,
      batchDistribution,
      quantityStatus,
      statusDistribution,
      stockTypeData,
      statusCounts,
    };
  }, [filteredStocks]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!stocks.length) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Database className="h-20 w-20 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Data in System</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              There are no stock items to analyze. Add some inventory data to see charts and statistics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      {/* Header with Time Period Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Stock trends and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="2weeks">Last 2 Weeks</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{analytics.statusCounts.available}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{analytics.statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{analytics.statusCounts.shipped}</div>
            <p className="text-xs text-muted-foreground mt-1">In transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{analytics.statusCounts.missing}</div>
            <p className="text-xs text-muted-foreground mt-1">Not found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contaminated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{analytics.statusCounts.contaminated}</div>
            <p className="text-xs text-muted-foreground mt-1">Damaged</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Type Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Stock by Type</CardTitle>
            <CardDescription>Quantity per stock number</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.stockByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Batch Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Distribution</CardTitle>
            <CardDescription>Quantity per batch number</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.batchDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="hsl(var(--secondary))" name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Items by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quantity Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Availability</CardTitle>
            <CardDescription>By quantity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.quantityStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.quantityStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Type Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Type Distribution</CardTitle>
            <CardDescription>Items by stock number</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.stockTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.stockTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;