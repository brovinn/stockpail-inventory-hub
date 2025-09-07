import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileSpreadsheet, 
  FileText, 
  BarChart3, 
  Download,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Presentation = () => {
  const { toast } = useToast();
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const existingForms = [
    {
      id: 1,
      name: "Stock Intake Form",
      type: "Excel",
      description: "Form for recording new stock arrivals",
      created: "2024-01-15",
      status: "Active"
    },
    {
      id: 2,
      name: "Stock Audit Checklist",
      type: "PDF",
      description: "Monthly stock audit verification form",
      created: "2024-01-10", 
      status: "Draft"
    },
    {
      id: 3,
      name: "Issue Report Form",
      type: "Web Form",
      description: "Report stock discrepancies and issues",
      created: "2024-01-08",
      status: "Active"
    }
  ];

  const existingReports = [
    {
      id: 1,
      name: "Monthly Stock Summary",
      type: "PDF Report",
      description: "Comprehensive monthly inventory overview",
      lastGenerated: "2024-01-20",
      status: "Scheduled"
    },
    {
      id: 2,
      name: "Low Stock Alert Report",
      type: "Excel Report",
      description: "Items below minimum threshold",
      lastGenerated: "2024-01-22",
      status: "Active"
    },
    {
      id: 3,
      name: "Stock Movement Analysis",
      type: "Interactive Dashboard",
      description: "Visual analytics of stock trends",
      lastGenerated: "2024-01-21",
      status: "Active"
    }
  ];

  const handleFormAction = (action: string, formId?: number) => {
    switch (action) {
      case "view":
        toast({
          title: "Opening Form",
          description: `Viewing form ${formId}`,
        });
        break;
      case "edit":
        toast({
          title: "Editing Form",
          description: `Opening form editor for form ${formId}`,
        });
        break;
      case "download":
        toast({
          title: "Downloading Form",
          description: `Form ${formId} download started`,
        });
        break;
      case "delete":
        toast({
          title: "Form Deleted",
          description: `Form ${formId} has been deleted`,
          variant: "destructive",
        });
        break;
    }
  };

  const handleReportAction = (action: string, reportId?: number) => {
    switch (action) {
      case "view":
        toast({
          title: "Opening Report",
          description: `Viewing report ${reportId}`,
        });
        break;
      case "settings":
        toast({
          title: "Report Settings",
          description: `Configuring report ${reportId}`,
        });
        break;
      case "download":
        toast({
          title: "Downloading Report",
          description: `Report ${reportId} download started`,
        });
        break;
    }
  };

  const handleCreateForm = () => {
    if (!formName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a form name",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Form Created",
      description: `${formName} has been created successfully`,
    });
    
    setFormName("");
    setFormDescription("");
  };

  const handleCreateReport = () => {
    if (!reportName.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a report name",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Report Created",
      description: `${reportName} has been created successfully`,
    });
    
    setReportName("");
    setReportDescription("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success';
      case 'Draft':
        return 'bg-warning/10 text-warning';
      case 'Scheduled':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Forms & Reports</h1>
        <p className="text-lg text-muted-foreground">
          Create custom forms and generate comprehensive reports for your stock management needs.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="forms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Form Builder
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Report Generator
          </TabsTrigger>
        </TabsList>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          {/* Create New Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Form
              </CardTitle>
              <CardDescription>
                Design custom data capture forms for various stock management processes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="formName">Form Name</Label>
                  <Input
                    id="formName"
                    placeholder="Enter form name..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formType">Form Type</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="pdf">PDF Form</option>
                    <option value="web">Web Form</option>
                    <option value="mobile">Mobile Form</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="formDescription">Description</Label>
                <Textarea
                  id="formDescription"
                  placeholder="Describe the purpose of this form..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateForm} className="w-full md:w-auto">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </CardContent>
          </Card>

          {/* Existing Forms */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Forms</CardTitle>
              <CardDescription>
                Manage your created forms and templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {existingForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{form.name}</h3>
                        <Badge variant="secondary">{form.type}</Badge>
                        <Badge className={getStatusColor(form.status)}>
                          {form.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{form.description}</p>
                      <p className="text-xs text-muted-foreground">Created: {form.created}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFormAction("view", form.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFormAction("edit", form.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFormAction("download", form.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFormAction("delete", form.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Create New Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Generate New Report
              </CardTitle>
              <CardDescription>
                Create comprehensive reports and analytics for stock management insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    placeholder="Enter report name..."
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="summary">Stock Summary</option>
                    <option value="movement">Stock Movement</option>
                    <option value="alerts">Low Stock Alerts</option>
                    <option value="audit">Audit Report</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportDescription">Description</Label>
                <Textarea
                  id="reportDescription"
                  placeholder="Describe what this report should include..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateReport} className="w-full md:w-auto">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Existing Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                Access your previously generated reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {existingReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{report.name}</h3>
                        <Badge variant="secondary">{report.type}</Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{report.description}</p>
                      <p className="text-xs text-muted-foreground">Last Generated: {report.lastGenerated}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReportAction("view", report.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReportAction("settings", report.id)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReportAction("download", report.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Presentation;
