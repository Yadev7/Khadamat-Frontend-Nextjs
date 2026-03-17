export type Service = {
  title: string;
  description: string;
  features: string[];
};

export const services: Record<string, Service> = {
  "seo-optimization": {
    title: "SEO Optimization",
    description: "Rank higher on Google and drive organic traffic to your site.",
    features: ["Keyword Research", "On-Page SEO", "Backlink Strategy"],
  },
  "web-development": {
    title: "Full-Stack Development",
    description: "We build fast, scalable web applications using Next.js.",
    features: ["React Integration", "API Development", "Cloud Hosting"],
  },
};