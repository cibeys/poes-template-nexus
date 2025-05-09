
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Edit, Trash2, Plus, Search, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setTemplates(templates.filter(template => template.id !== id));
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete the template",
        variant: "destructive"
      });
    }
  };
  
  const incrementDownloadCount = async (id: string) => {
    try {
      const template = templates.find(t => t.id === id);
      if (!template) return;
      
      const { error } = await supabase
        .from("templates")
        .update({
          download_count: (template.download_count || 0) + 1
        })
        .eq("id", id);
        
      if (error) throw error;
      
      setTemplates(templates.map(t => 
        t.id === id ? { ...t, download_count: (t.download_count || 0) + 1 } : t
      ));
    } catch (error) {
      console.error("Error incrementing download count:", error);
    }
  };
  
  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground">
            Manage website templates
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            A list of all templates on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center p-4">Loading...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No templates found.</p>
              <Button asChild className="mt-4">
                <Link to="/dashboard/admin/templates/new">Add Your First Template</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.title}</TableCell>
                      <TableCell>
                        {template.is_premium ? (
                          <Badge>Premium</Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell>{template.download_count || 0}</TableCell>
                      <TableCell>{new Date(template.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/templates/${template.slug}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/dashboard/admin/templates/edit/${template.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {template.download_url && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                incrementDownloadCount(template.id);
                                window.open(template.download_url, '_blank');
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
