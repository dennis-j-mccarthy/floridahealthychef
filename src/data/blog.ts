export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  body: BlogBlock[];
};

export const blogCategories = [
  "Food Facts",
  "Healthy Eating",
  "Southwest Florida Ingredients",
  "Personal Chef",
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "differences-between-a-personal-chef-and-a-private-chef",
    title: "Differences Between a Personal Chef and a Private Chef",
    category: "Personal Chef",
    excerpt: "As Southwest Florida's healthy personal chef, I often encounter people curious about the difference between a personal chef and a private chef. This distinction might influence your decision when seeking…",
    image: "/images/blog/differences-between-a-personal-chef-and-a-private-chef.jpg",
    body: [
      { type: "p", text: "As Southwest Florida's healthy personal chef, I often encounter people curious about the difference between a personal chef and a private chef. This distinction might influence your decision when seeking top-notch healthy cooking tailored to your needs. Let's delve into the nuances of these culinary professions!" },
      { type: "h2", text: "What is a Personal Chef" },
      { type: "p", text: "I'm Beth McCarthy, a personal chef offering my services across beautiful Southwest Florida. Here's what defines a personal chef:" },
      {
        type: "ul",
        items: [
          "Personalized Meals: I customize menus to suit individual tastes, dietary requirements, and health goals.",
          "Flexible Service: I come to your home, prepare meals for the week, or cater special occasions, adjusting to your schedule.",
          "Healthy Focus: Healthy cooking is my forte, using fresh, local ingredients to craft nutritionally balanced dishes.",
        ],
      },
      { type: "h2", text: "What is a Private Chef" },
      { type: "p", text: "A private chef, on the other hand, usually dedicates their services exclusively to one client or family. Their unique features include:" },
      {
        type: "ul",
        items: [
          "Full-Time Commitment: Private chefs often live with the client, preparing all daily meals and snacks.",
          "Continuous Availability: They are typically available for cooking anytime, according to the client's preferences.",
          "Exclusive Attention: Private chefs work only with one client.",
        ],
      },
      { type: "h2", text: "A Unique Blend with a Healthy Twist" },
      { type: "p", text: "If you are seeking top-notch healthy cooking in Southwest Florida, including Naples, Fort Myers, or Bonita, I strive to provide a unique blend of personal chef services:" },
      {
        type: "ul",
        items: [
          "Culinary Expertise: My specialty is in crafting delicious, nutritious meals that elevate everyday dining to a gourmet experience.",
          "Flexibility and Customization: Whether you need occasional dinners or regular meal planning, I adapt to your specific needs.",
          "Serving Various Locations: I bring culinary artistry to different parts of Southwest Florida, including Naples, Bonita Springs, Fort Myers, Estero, and Punta Gorda.",
        ],
      },
      { type: "p", text: "Understanding the difference between a personal chef and a private chef is essential in choosing the culinary service that best fits your lifestyle. As a personal chef, I offer a blend of personalization, flexibility, and commitment to health. Serving the beautiful Southwest Florida region, I'm passionate about transforming everyday meals into culinary delights." },
      { type: "p", text: "Ready to explore the world of healthy cooking with Southwest Florida's healthiest personal chef? Contact me to create a personalized culinary experience in Naples, Estero, Fort Myers, Punta Gorda, or Bonita!" },
    ],
  },
  {
    slug: "whats-a-personal-chef",
    title: "What's a Personal Chef?",
    category: "Personal Chef",
    excerpt: "Have you ever found yourself craving gourmet, organic meals but constrained by time or culinary expertise? In the bustling communities of Naples, Estero, Fort Myers, Punta Gorda, and Bonita, the…",
    image: "/images/blog/whats-a-personal-chef.jpg",
    body: [
      { type: "p", text: "Have you ever found yourself craving gourmet, organic meals but constrained by time or culinary expertise? In the bustling communities of Naples, Estero, Fort Myers, Punta Gorda, and Bonita, the solution lies in the hands of a personal chef. Imagine having healthy, tailor-made dishes prepared right in your kitchen. I'm Beth McCarthy, Southwest Florida's healthiest personal chef, and I'm here to bring magic to your plate. But first, let me explain what exactly a personal chef is, and why this concept is gaining momentum in our fast-paced world." },
      { type: "h2", text: "What is a Personal Chef" },
      { type: "p", text: "A personal chef is a culinary expert who crafts customized, healthy meals in the comfort of your home. Unlike private chefs, who often live with the clients, I prepare meals according to your preferences and dietary needs." },
      {
        type: "ul",
        items: [
          "Healthy Organic Ingredients: I emphasize fresh, organic, locally sourced ingredients, turning them into culinary masterpieces.",
          "Food as Medicine: Tailoring meals to your health goals is the essence of my personal chef services in Southwest Florida. My unique approach aligns your diet with wellness, viewing food as therapeutic and nourishing.",
        ],
      },
      { type: "h2", text: "The Importance of Healthy Organic Ingredients" },
      { type: "p", text: "In today's world, the focus on healthy, organic ingredients is more than a trend—it’s a necessity. My personal chef experience:" },
      {
        type: "ul",
        items: [
          "Highlights beautiful organic non-GMO produce and products, including fruits, vegetables and fresh herbs, hand-picked with care.",
          "Encourages local farming and sustainability.",
          "Ensures purity, avoiding pesticides and harmful chemicals.",
          "Creates vibrant flavors, promoting overall well-being and culinary diversity.",
        ],
      },
      { type: "h2", text: "Food as Medicine - Tailored to Your Health Goals" },
      { type: "p", text: "Understanding the importance of food as medicine, I masterfully blend taste and nutrition:" },
      {
        type: "ul",
        items: [
          "Personalized diets to combat health issues.",
          "Weight management solutions.",
          "Utilization of superfoods and natural remedies.",
        ],
      },
      { type: "h2", text: "Culinary Wellness Guide" },
      { type: "p", text: "Looking for top-notch healthy cooking in Southwest Florida? I'm more than a personal chef; I'm a culinary wellness guide." },
      {
        type: "ul",
        items: [
          "Serving areas including Naples, Fort Myers, and Bonita, Fort Myers, Punta Gorda.",
          "Specialized in a variety of dietary needs.",
          "Committed to excellence, creativity, and health.",
          "Strong emphasis on client relationships and satisfaction.",
        ],
      },
      { type: "p", text: "In our bustling lives, the personal chef experience represents a bridge between luxury and necessity. Serving Southwest Florida, I exemplify the epitome of healthy, personalized culinary artistry. Ready to embrace a new level of wellness through food? Connect with me today, and discover how your kitchen can transform into a haven of health and flavor!" },
      { type: "p", text: "Indulge in a personal chef experience with today and transform your daily meals into a joyous journey towards health. To book your personalized culinary adventure in Naples, Estero, Fort Myers, Punta Gorda, or Bonita, call Beth at 719-440-2815." },
    ],
  },
  {
    slug: "are-personal-chefs-affordable",
    title: "Are Personal Chefs Affordable?",
    category: "Southwest Florida Ingredients",
    excerpt: "In the bustling cities of Southwest Florida, including Naples, Estero, Fort Myers, Punta Gorda, and Bonita, the search for convenient yet healthy eating solutions often leads to a single question:…",
    image: "/images/blog/are-personal-chefs-affordable.jpg",
    body: [
      { type: "p", text: "In the bustling cities of Southwest Florida, including Naples, Estero, Fort Myers, Punta Gorda, and Bonita, the search for convenient yet healthy eating solutions often leads to a single question: \"Are personal chefs affordable?\" The idea of hiring a personal chef may seem like a luxury, but I, Beth McCarthy, Southwest Florida's healthiest personal chef, am here to reveal how it can be an accessible, wise investment for your health and lifestyle." },
      { type: "h2", text: "What is a Personal Chef" },
      { type: "p", text: "A personal chef offers tailored culinary services, preparing meals according to your specific tastes, dietary requirements, and health goals. As your personal chef, I can deliver:" },
      {
        type: "ul",
        items: [
          "Customized Menu Planning: Meals designed around your preferences and nutritional needs.",
          "Convenience and Quality: Professional cooking in your own home with fresh, locally sourced ingredients.",
          "Healthy Eating Simplified: Nutritious meals that support your wellness journey, without the hassle of cooking and planning.",
        ],
      },
      { type: "h2", text: "Is a Personal Chef Affordable" },
      { type: "p", text: "The cost of hiring a personal chef might surprise you. Let's break down the affordability aspect:" },
      {
        type: "ul",
        items: [
          "Price Range: Personal chefs in Southwest Florida typically charge between $300-$600 per week. This includes meal planning, shopping, cooking, packaging, labeling, and full kitchen cleanup.",
          "Compare Cost to Unhealthy Foods: Often, the convenience of fast food and processed meals lead to unhealthy choices. Investing in a personal chef ensures quality, healthy eating without breaking the bank.",
          "Time Savings for Busy Professionals or Working Families: The cost also includes the value of your time. Imagine the hours saved from meal planning, shopping, cooking, and cleaning – time that could be spent with family or pursuing other interests.",
        ],
      },
      { type: "h2", text: "Tailored to Budget and Needs" },
      { type: "p", text: "Seeking top-notch healthy cooking in Southwest Florida? Here's how I aim to make personal chef services accessible and valuable:" },
      {
        type: "ul",
        items: [
          "Tailored Pricing: I offer flexible pricing options to fit various budgets and needs.",
          "Emphasis on Health: I prioritize healthy, organic ingredients that align with your wellness goals.",
          "Serving Various Locations: From Naples to Bonita, I provide culinary services that enrich your daily dining experience.",
        ],
      },
      { type: "p", text: "The question of affordability in hiring a personal chef is more nuanced than it might seem at first glance. When you factor in the quality of ingredients, the convenience, the time saved, and the benefit to your overall health, it becomes a compelling investment. As Southwest Florida's healthiest personal chef, I strive to bring gourmet, nutritious meals into your home at an accessible price point." },
      { type: "p", text: "Ready to embrace a convenient and healthy culinary lifestyle? Contact me, Beth McCarthy, today to discover personalized, top-notch healthy cooking in Naples, Estero, Fort Myers, Punta Gorda, or Bonita!" },
    ],
  },
  {
    slug: "enhance-intimate-gatherings-and-parties-with-a-healthy-chef",
    title: "Enhance Intimate Gatherings and Parties with a Healthy Chef",
    category: "Food Facts",
    excerpt: "Planning an intimate gathering or party in Southwest Florida? Whether it's in Naples, Estero, Fort Myers, Punta Gorda, or Bonita, the right catering can make or break your event. But…",
    image: "/images/blog/enhance-intimate-gatherings-and-parties-with-a-healthy-chef.jpg",
    body: [
      { type: "p", text: "Planning an intimate gathering or party in Southwest Florida? Whether it's in Naples, Estero, Fort Myers, Punta Gorda, or Bonita, the right catering can make or break your event. But have you ever considered the unparalleled experience of hiring a personal chef? I'm Beth McCarthy, Southwest Florida's healthiest personal chef, and I want to take you on a culinary journey that's both delicious and educational." },
      { type: "h2", text: "What is a Personal Chef" },
      { type: "p", text: "A personal chef offers a customized culinary service, crafting menus that suit your preferences and dietary requirements. Whether it's a family dinner, a celebration, or a special event, a personal chef brings the fine dining experience right to your home or venue." },
      { type: "h2", text: "Benefits of a Personal Chef for Intimate Events and Parties" },
      { type: "p", text: "The decision to hire a personal chef for intimate gatherings and parties offers a host of advantages:" },
      {
        type: "ul",
        items: [
          "Tailored Menu: Every dish is personalized to your tastes and dietary needs.",
          "Exquisite Presentation: Elevate your event with gourmet plating and artful presentation.",
          "Stress-Free Experience: No need to worry about cooking or cleanup – it's all taken care of.",
        ],
      },
      { type: "h2", text: "The Educational Aspect" },
      { type: "p", text: "What sets me apart is the unique educational aspect I bring to your event:" },
      {
        type: "ul",
        items: [
          "Interactive Cooking Experience: Engage your guests with live cooking demonstrations.",
          "Healthy Choices Made Delicious: I explain the array of foods served and how healthy choices can be flavorful and satisfying.",
          "Culinary Insights: Share the joy of cooking with tips, techniques, and insights that turn the dining experience into a delightful learning opportunity.",
        ],
      },
      { type: "h2", text: "How Beth McCarthy is the Ideal Solution for Intimate Parties and Events" },
      { type: "p", text: "If you're seeking top-notch healthy cooking for intimate parties and events in Southwest Florida, here's how I can elevate your experience:" },
      {
        type: "ul",
        items: [
          "Local and Organic Ingredients: Committed to fresh, healthy, and sustainably sourced ingredients.",
          "Unforgettable Experience: Beyond delicious meals, I provide an engaging and interactive culinary adventure.",
          "Various Locations Served: From Naples to Bonita, I offer my personal chef services across Southwest Florida.",
        ],
      },
      { type: "p", text: "The experience of hiring a personal chef goes beyond mere catering; it's about crafting an unforgettable, intimate experience that leaves guests both satisfied and educated. It's the joy of sharing good food, learning, and celebration all rolled into one. As Southwest Florida's healthy personal chef, I strive to make your intimate gatherings and parties not just memorable but also a delightful culinary learning experience." },
      { type: "p", text: "Ready to turn your next gathering or event into a unique culinary adventure? Contact me, Beth McCarthy, today to discover how you can elevate your intimate parties and events in Naples, Estero, Fort Myers, Punta Gorda, or Bonita!" },
    ],
  },
];
