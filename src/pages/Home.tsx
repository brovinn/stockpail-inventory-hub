import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case "dashboard":
        navigate("/");
        toast({
          title: "Navigating to Dashboard",
          description: "Opening main inventory dashboard",
        });
        break;
      case "report":
        navigate("/presentation");
        toast({
          title: "Opening Report Generator",
          description: "Navigate to Forms & Reports section",
        });
        break;
      case "analytics":
        toast({
          title: "Analytics Dashboard",
          description: "Advanced analytics coming soon!",
        });
        break;
      default:
        break;
    }
  };

  const quickActions = [
    {
      title: "Add New Stock",
      description: "Quickly add new inventory items",
      icon: Package,
      action: "Go to Dashboard",
      actionType: "dashboard",
      variant: "default" as const
    },
    {
      title: "Generate Report",
      description: "Create stock reports and analytics",
      icon: FileText,
      action: "Create Report",
      actionType: "report",
      variant: "secondary" as const
    },
    {
      title: "View Analytics",
      description: "Check stock trends and insights",
      icon: BarChart3,
      action: "View Charts",
      actionType: "analytics",
      variant: "outline" as const
    }
  ];

  const recentActivities = [
    {
      type: "addition",
      item: "Batch #B001 - Widget A",
      time: "2 hours ago",
      status: "completed"
    },
    {
      type: "update",
      item: "Stock #S123 - Component B",
      time: "4 hours ago", 
      status: "pending"
    },
    {
      type: "alert",
      item: "Low Stock Alert - Item C",
      time: "6 hours ago",
      status: "warning"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'warning':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Welcome to Stock Pail</h1>
        <p className="text-lg text-muted-foreground">
          Manage your inventory efficiently with our comprehensive stock management system.
        </p>
      </div>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-professional-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={action.variant} 
                  className="w-full"
                  onClick={() => handleQuickAction(action.actionType)}
                >
                  {action.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Latest Updates
            </CardTitle>
            <CardDescription>
              Track your recent inventory changes and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="font-medium text-foreground">{activity.item}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
};

export default Home;