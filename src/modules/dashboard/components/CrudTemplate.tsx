
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Define the form schema
const templateSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters long" })
    .regex(/^[a-z0-9-]+$/, { 
      message: "Slug can only contain lowercase letters, numbers, and hyphens" 
    }),
  thumbnail: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  download_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  preview_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  github_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  is_premium: z.boolean().default(false),
  tech_stack: z.string().transform(val => val ? val.split(",").map(item => item.trim()) : []),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export default function CrudTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  
  // Initialize form with default values
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: "",
      description: "",
      slug: "",
      thumbnail: "",
      download_url: "",
      preview_url: "",
      github_url: "",
      is_premium: false,
      tech_stack: "",
    },
  });
  
  // Fetch template data if editing
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) {
        setInitialLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("templates")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.reset({
            title: data.title,
            description: data.description || "",
            slug: data.slug,
            thumbnail: data.thumbnail || "",
            download_url: data.download_url || "",
            preview_url: data.preview_url || "",
            github_url: data.github_url || "",
            is_premium: data.is_premium || false,
            tech_stack: data.tech_stack ? data.tech_stack.join(", ") : "",
          });
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        toast({
          title: "Error",
          description: "Failed to load template data",
          variant: "destructive"
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchTemplate();
  }, [id, form, toast]);
  
  const onSubmit = async (data: TemplateFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create or edit templates", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    
    try {
      if (id) {
        // Update existing template
        const { error } = await supabase
          .from("templates")
          .update({
            title: data.title,
            description: data.description,
            slug: data.slug,
            thumbnail: data.thumbnail || null,
            download_url: data.download_url || null,
            preview_url: data.preview_url || null,
            github_url: data.github_url || null,
            is_premium: data.is_premium,
            tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
          
        if (error) throw error;
        
        toast({
          title: "Template updated",
          description: "Your template has been updated successfully",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from("templates")
          .insert({
            title: data.title,
            description: data.description,
            slug: data.slug,
            thumbnail: data.thumbnail || null,
            download_url: data.download_url || null,
            preview_url: data.preview_url || null,
            github_url: data.github_url || null,
            is_premium: data.is_premium,
            tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
          });
          
        if (error) throw error;
        
        toast({
          title: "Template created",
          description: "Your template has been created successfully",
        });
      }
      
      // Redirect back to template list
      navigate("/dashboard/admin/templates");
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? "Edit Template" : "Create New Template"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Template title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="template-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used for the URL (e.g., /templates/template-slug)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your template..." 
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to the template preview image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="download_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Download URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/download" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preview_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preview URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/preview" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="github_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username/repo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tech_stack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tech Stack</FormLabel>
                      <FormControl>
                        <Input placeholder="React, Next.js, Tailwind" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of technologies
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_premium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Premium Template</FormLabel>
                      <FormDescription>
                        Mark this template as premium content
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {id ? "Update Template" : "Create Template"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
