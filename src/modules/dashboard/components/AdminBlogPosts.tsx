import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

// Define the status type explicitly to match TypeScript requirements
type PostStatus = "draft" | "published" | "archived";

interface Post {
  id: number;
  title: string;
  author: string;
  category: string;
  status: PostStatus; // Using the explicit type
  date: string;
}

export default function AdminBlogPosts() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: "Getting Started with React",
      author: "Jane Smith",
      category: "React",
      status: "published",
      date: "2023-04-12"
    },
    {
      id: 2,
      title: "Advanced TypeScript Features",
      author: "John Doe",
      category: "TypeScript",
      status: "draft",
      date: "2023-03-15"
    },
    {
      id: 3,
      title: "The Future of Web Development",
      author: "Alice Johnson",
      category: "General",
      status: "archived",
      date: "2023-02-01"
    },
  ]);

  const updatePostStatus = (id: number, status: PostStatus) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, status } : post
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage all blog posts across the site
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Card>
        <Table>
          <TableCaption>A list of all blog posts</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      post.status === "published" ? "default" :
                      post.status === "draft" ? "secondary" : "destructive"
                    }
                  >
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>{post.date}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updatePostStatus(post.id, "published")}
                      >
                        Publish
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updatePostStatus(post.id, "draft")}
                      >
                        Mark as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updatePostStatus(post.id, "archived")}
                        className="text-red-600"
                      >
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
