-- Create enum for repeat type
CREATE TYPE public.repeat_type AS ENUM ('none', 'daily', 'weekly', 'monthly');

-- Create enum for task category
CREATE TYPE public.task_category AS ENUM ('work', 'study', 'personal');

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category public.task_category NOT NULL DEFAULT 'personal',
    repeat_type public.repeat_type NOT NULL DEFAULT 'none',
    is_focus BOOLEAN NOT NULL DEFAULT FALSE,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster date queries
CREATE INDEX idx_tasks_dates ON public.tasks (user_id, start_date, end_date);
CREATE INDEX idx_tasks_parent ON public.tasks (parent_task_id);