
# POES - Project Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Project Setup](#project-setup)
3. [Folder Structure](#folder-structure)
4. [Features](#features)
5. [Supabase Database Setup](#supabase-database-setup)
6. [Authentication](#authentication)
7. [Theme Customization](#theme-customization)
8. [Games](#games)
9. [Blog and Templates](#blog-and-templates)
10. [Chat System](#chat-system)
11. [Dashboard](#dashboard)

## Introduction

POES is a comprehensive web application featuring a blog system, template marketplace, games, theme customization, and an admin dashboard. The application is built with React, TypeScript, Tailwind CSS, Shadcn UI, and Supabase for backend functionality.

## Project Setup

### Prerequisites
- Node.js (v16+)
- NPM or Yarn
- Supabase Account

### Installation
1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Set up Supabase (see [Supabase Database Setup](#supabase-database-setup))
4. Start the development server: `npm run dev` or `yarn dev`

## Folder Structure

The project follows a feature-based folder structure:

```
src/
├── common/                  # Shared components and utilities
│   ├── components/           
│   │   ├── layouts/         # Layout components (MainLayout, DashboardLayout)
│   │   └── ThemeProvider.tsx
│   └── types/               # Shared type definitions
├── components/              # UI components (Shadcn)
│   └── ui/                  # Shadcn UI components
├── contexts/                # React contexts (Auth, Theme)
├── hooks/                   # Custom React hooks
├── integrations/            # External service integrations
│   └── supabase/            # Supabase client and types
├── lib/                     # Utility functions
├── modules/                 # Feature modules
│   ├── blog/                # Blog related components
│   ├── dashboard/           # Dashboard components
│   ├── games/               # Game components
│   ├── home/                # Home page components
│   ├── templates/           # Template components
│   └── tools/               # Tool components
├── pages/                   # Page components
│   ├── Index.tsx            # Home page
│   ├── Login.tsx            # Login page
│   └── ...                  # Other pages
├── types/                   # TypeScript type definitions
├── App.tsx                  # Main App component
├── index.css                # Global styles
└── main.tsx                 # Entry point
```

## Features

POES includes the following features:
- 🎮 Interactive Games (Snake, Slot Machine, Block Blast, etc.)
- 📝 Blog System
- 🖼️ Template Marketplace
- 🎨 Theme Customizer
- 💬 Chat System
- 🔐 User Authentication
- 📊 Admin Dashboard

## Supabase Database Setup

### 1. Create a Supabase Project
1. Sign up or log in at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the project URL and anon key

### 2. Database Schema

The application requires the following tables:

#### Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role USER_ROLE DEFAULT 'user'::USER_ROLE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enum type for user roles
CREATE TYPE USER_ROLE AS ENUM ('user', 'admin');

-- Set up RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

#### Blog Posts Table
```sql
-- Create enum for post status
CREATE TYPE POST_STATUS AS ENUM ('draft', 'published', 'archived');

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  slug TEXT UNIQUE NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES public.profiles(id),
  status POST_STATUS DEFAULT 'draft'::POST_STATUS,
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  view_count INTEGER DEFAULT 0
);

-- Set up RLS for blog posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Published posts are viewable by everyone"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published'::POST_STATUS OR auth.uid() = author_id);

CREATE POLICY "Users can insert their own posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON public.blog_posts
  FOR UPDATE
  USING (auth.uid() = author_id);
```

#### Categories Table
```sql
-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Post-category relationship table
CREATE TABLE public.post_categories (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Set up RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "Post categories are viewable by everyone"
  ON public.post_categories
  FOR SELECT
  USING (true);
```

#### Templates Table
```sql
-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  thumbnail TEXT,
  preview_url TEXT,
  download_url TEXT,
  github_url TEXT,
  tech_stack TEXT[],
  is_premium BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Template categories
CREATE TABLE public.template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Template-category relationship
CREATE TABLE public.template_category_relation (
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.template_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, category_id)
);

-- Template tags
CREATE TABLE public.template_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Template-tag relationship
CREATE TABLE public.template_tag_relation (
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.template_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, tag_id)
);

-- Set up RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_category_relation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_tag_relation ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Templates are viewable by everyone"
  ON public.templates
  FOR SELECT
  USING (true);
```

#### Chat System Tables
```sql
-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  admin_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up RLS for chat messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = admin_id);

CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3. Database Functions

Create the following functions in the Supabase SQL editor:

#### Chat Functions
```sql
-- Function to count unread messages for admins
CREATE OR REPLACE FUNCTION public.count_unread_admin_messages()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_messages
    WHERE admin_id IS NULL
    AND is_read = false
  );
END;
$$;

-- Function to count unread messages for a specific user
CREATE OR REPLACE FUNCTION public.count_unread_user_messages(user_id UUID)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_messages
    WHERE user_id = $1
    AND admin_id IS NOT NULL
    AND is_read = false
  );
END;
$$;

-- Function to get users with messages for admin dashboard
CREATE OR REPLACE FUNCTION public.get_users_with_messages()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  unread_count BIGINT,
  last_message TEXT,
  last_activity TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH message_stats AS (
    SELECT
      p.id,
      p.full_name,
      p.username,
      p.avatar_url,
      COUNT(CASE WHEN cm.is_read = false AND cm.admin_id IS NULL THEN 1 END) as unread_count,
      (SELECT message FROM chat_messages 
       WHERE (user_id = p.id OR admin_id = p.id)
       ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM chat_messages 
       WHERE (user_id = p.id OR admin_id = p.id)
       ORDER BY created_at DESC LIMIT 1) as last_activity
    FROM profiles p
    JOIN chat_messages cm ON cm.user_id = p.id OR cm.admin_id = p.id
    GROUP BY p.id, p.full_name, p.username, p.avatar_url
  )
  SELECT * FROM message_stats
  ORDER BY last_activity DESC;
END;
$$;

-- Function to get chat messages between user and admins
CREATE OR REPLACE FUNCTION public.get_chat_messages_with_user(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  admin_id UUID,
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.user_id,
    cm.admin_id,
    cm.message,
    cm.is_read,
    cm.created_at,
    cm.updated_at
  FROM chat_messages cm
  WHERE cm.user_id = user_id_param 
     OR cm.admin_id = user_id_param
  ORDER BY cm.created_at ASC;
END;
$$;

-- Function to get messages for a specific user
CREATE OR REPLACE FUNCTION public.get_user_messages(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  admin_id UUID,
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.user_id,
    cm.admin_id,
    cm.message,
    cm.is_read,
    cm.created_at,
    cm.updated_at
  FROM chat_messages cm
  WHERE cm.user_id = user_id_param 
     OR cm.admin_id = user_id_param
  ORDER BY cm.created_at ASC;
END;
$$;

-- Function to mark messages as read by admin
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(message_ids UUID[], admin_id_param UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE chat_messages
  SET is_read = true,
      admin_id = admin_id_param,
      updated_at = now()
  WHERE id = ANY(message_ids);
END;
$$;

-- Function to mark messages as read by user
CREATE OR REPLACE FUNCTION public.mark_user_messages_as_read(message_ids UUID[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE chat_messages
  SET is_read = true,
      updated_at = now()
  WHERE id = ANY(message_ids);
END;
$$;

-- Function for admin to send message to user
CREATE OR REPLACE FUNCTION public.send_admin_message(to_user_id UUID, message_text TEXT, from_admin_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_message_id UUID;
BEGIN
  INSERT INTO chat_messages (user_id, admin_id, message, is_read)
  VALUES (from_admin_id, to_user_id, message_text, false)
  RETURNING id INTO new_message_id;
  
  RETURN new_message_id;
END;
$$;

-- Function for user to send message
CREATE OR REPLACE FUNCTION public.send_user_message(message_text TEXT, from_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_message_id UUID;
BEGIN
  INSERT INTO chat_messages (user_id, message, is_read)
  VALUES (from_user_id, message_text, false)
  RETURNING id INTO new_message_id;
  
  RETURN new_message_id;
END;
$$;
```

#### Blog Functions
```sql
-- Function to increment blog post view count
CREATE OR REPLACE FUNCTION public.increment_blog_view(post_id UUID, session TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  existing_view_count INTEGER;
BEGIN
  -- Check if the session has already viewed this post in the last day
  SELECT COUNT(*) INTO existing_view_count 
  FROM blog_views 
  WHERE blog_post_id = post_id 
  AND session_id = session 
  AND viewed_at > (now() - interval '1 day');
  
  -- If no recent view, insert a new view record and update the blog_posts view_count
  IF existing_view_count = 0 THEN
    INSERT INTO blog_views (blog_post_id, session_id) VALUES (post_id, session);
    
    UPDATE blog_posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = post_id;
  END IF;
END;
$$;
```

#### Template Functions
```sql
-- Function to increment template download count
CREATE OR REPLACE FUNCTION public.increment_template_download(temp_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE templates
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = temp_id;
END;
$$;
```

### 4. Triggers

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    LOWER(SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://www.gravatar.com/avatar/' || md5(LOWER(NEW.email)) || '?d=mp'),
    CASE
      WHEN NEW.email = 'admin@example.com' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
  );
  RETURN NEW;
END;
$$;

-- Create trigger to update timestamps
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create trigger to handle new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

### 5. Set Up Authentication

1. Go to Authentication > Settings
2. Configure the following settings:
   - Site URL: Your application URL
   - Redirect URLs: Your application URLs (including localhost for development)
   - Disable email confirmation if needed for development
   - Enable "Enable email signup"

## Authentication

The application uses Supabase Authentication for user management. Key files:

- `src/contexts/AuthContext.tsx` - Manages authentication state
- `src/pages/Login.tsx` - Login form
- `src/pages/Register.tsx` - Registration form

## Theme Customization

The theme customizer allows users to change colors, fonts, and other UI aspects:

- `src/contexts/ThemeContext.tsx` - Theme settings and state
- `src/components/ThemeCustomizer.tsx` - UI for theme customization

The theme customizer supports:
- Primary and surface color selection
- Font family and size adjustments
- Light/dark mode toggle
- Preset themes
- Border radius customization

## Games

Various games are implemented in `src/modules/games/components/`:

1. **Snake Game** - Classic snake game
2. **Slot Machine** - Slot machine with animations
3. **Block Blast** - Match-3 style game
4. **Puzzle Game** - Sliding puzzle
5. **Memory Match** - Card matching game
6. **Math Game** - Math challenge game

Access games via the `/games` route.

## Blog and Templates

### Blog System
- `src/modules/blog/components/` - Blog components
- `src/pages/Blog.tsx` - Blog listing page
- `src/pages/BlogPost.tsx` - Single blog post page

### Templates
- `src/modules/templates/components/` - Template components
- `src/pages/Templates.tsx` - Template listing page
- `src/pages/TemplateDetail.tsx` - Template detail page

## Chat System

The chat system allows users to communicate with support:

- `src/modules/dashboard/components/AdminChat.tsx` - For admins to respond to users
- `src/modules/dashboard/components/UserChat.tsx` - For users to message support

## Dashboard

The admin dashboard includes:
- Blog post management
- Template management
- User management
- Chat support
- Analytics

Access the dashboard via the `/dashboard` route.

---

For more information or support, refer to the project repository or contact the development team.
