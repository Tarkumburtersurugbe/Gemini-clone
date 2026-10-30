import { SampleMediaItem } from '../types';

export const SAMPLE_MEDIA: SampleMediaItem[] = [
  {
    id: 'sample-video-nature',
    title: 'Coastal Ocean Waves & Cliffs',
    description: 'High-definition ocean drone footage along rugged sea cliffs.',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mimeType: 'video/mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60',
    suggestedPrompt: 'Provide a chronological scene-by-scene analysis with timestamps, noting camera movement, lighting, water dynamics, and geological structures.',
  },
  {
    id: 'sample-video-tech',
    title: 'Chromecast Tech Experience',
    description: 'Dynamic commercial clip showcasing mobile streaming, living room environments, and UI interaction.',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    mimeType: 'video/mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
    suggestedPrompt: 'Analyze this video clip: identify all depicted user actions, product hardware, visual lighting changes, and summarize the core marketing hook.',
  },
  {
    id: 'sample-video-nature2',
    title: 'Forest & Wildlife Exploration',
    description: 'Scenic high-resolution nature landscape exploration with rich flora and lighting.',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    mimeType: 'video/mp4',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60',
    suggestedPrompt: 'Break down the natural biome, colors, ambient mood, and describe potential ecological observations in this clip.',
  },
  {
    id: 'sample-image-diagram',
    title: 'Neural Network Architecture',
    description: 'Complex technical system diagram showing transformer multi-head attention layers and embeddings.',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60',
    suggestedPrompt: 'Analyze this visual: explain the theoretical machine learning architecture represented, breakdown the signal flow, and highlight practical engineering considerations.',
  },
  {
    id: 'sample-image-chart',
    title: 'Global Renewable Energy Analytics',
    description: 'Data visualization chart showing clean energy generation metrics, growth curves, and forecasts.',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
    suggestedPrompt: 'Extract all quantifiable metrics and trends from this dashboard. Identify peak anomalies, calculate growth trajectory, and summarize actionable insights.',
  },
  {
    id: 'sample-image-receipt',
    title: 'Invoice / Financial Document',
    description: 'Financial document sample for high-precision OCR and entity extraction.',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
    suggestedPrompt: 'Perform visual OCR: parse every line item, calculate subtotal, sales tax, total amounts, date, and output as clean formatted JSON.',
  },
];

export const STARTER_PROMPTS = [
  {
    icon: 'sparkles',
    title: 'Multimodal Media Analysis',
    prompt: 'Can you analyze the key visual features, color harmony, and composition of my uploaded media?',
    category: 'Vision',
  },
  {
    icon: 'video',
    title: 'Timestamped Video Breakdown',
    prompt: 'Break down the uploaded video scene-by-scene with timestamps [00:00], noting actions, objects, and ambient sound.',
    category: 'Video',
  },
  {
    icon: 'code',
    title: 'Full-Stack Code Architecture',
    prompt: 'Write a TypeScript reactive state machine for managing an asynchronous audio processing pipeline with error recovery.',
    category: 'Coding',
  },
  {
    icon: 'palette',
    title: 'Concept Art & Image Prompt',
    prompt: 'Design an ultra-detailed cyberpunk street market in neo-Tokyo during a rainstorm with volumetric neon lighting.',
    category: 'Imagen',
  },
  {
    icon: 'search',
    title: 'Search-Grounded Research',
    prompt: 'What are the most recent breakthrough developments in multimodal AI reasoning and video generative models?',
    category: 'Research',
  },
  {
    icon: 'mic',
    title: 'Audio Speech Synthesis',
    prompt: 'Synthesize a natural, expressive voice narration introducing our next-generation Gemini multimodal studio.',
    category: 'Audio',
  },
];

export const IMAGE_STYLE_PRESETS = [
  { id: 'cinematic', label: 'Cinematic Film', promptModifier: '35mm anamorphic photography, cinematic lighting, shot on ARRI Alexa, shallow depth of field, 8k resolution' },
  { id: 'photoreal', label: 'Photorealistic', promptModifier: 'ultra-realistic candid DSLR photo, 85mm portrait lens, natural ambient lighting, hyper-detailed textures, raw photographic quality' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', promptModifier: 'cyberpunk aesthetic, vibrant volumetric neon glow, rainy reflections, futuristic sci-fi city, high contrast dark atmosphere' },
  { id: 'anime', label: 'Anime / Shinkai', promptModifier: 'gorgeous Makoto Shinkai anime aesthetic, lush vibrant skies, delicate light scattering, hand-drawn anime masterpiece, Studio Ghibli inspired' },
  { id: 'unreal', label: '3D Render / Pixar', promptModifier: '3D digital art, Pixar and Disney animated style, subsurface scattering, playful lighting, 4k Octane render' },
  { id: 'watercolor', label: 'Watercolor Painting', promptModifier: 'delicate expressive watercolor on textured paper, bleeding pigments, organic brush strokes, soft pastel palette' },
  { id: 'minimalist', label: 'Minimalist Vector', promptModifier: 'clean Swiss graphic design, flat vector art, bold harmonious color palette, elegant geometric composition' },
  { id: 'fantasy', label: 'Dark Fantasy', promptModifier: 'dark fantasy concept art, atmospheric mist, gothic architecture, dramatic chiaroscuro, intricate fantasy details' },
];
