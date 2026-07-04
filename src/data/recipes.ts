// Recipe content ported from the live Webflow site (www.floridahealthychef.com).
// Time/servings/difficulty are curated values — the Webflow CMS metadata fields are empty.

export type CategorySlug =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "salad"
  | "sweet-endings";

export type CategoryLabel =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Salad"
  | "Sweet Endings";

export interface RecipeCategory {
  slug: CategorySlug;
  label: CategoryLabel;
}

export interface IngredientGroup {
  /** e.g. "For the Lemon Honey Dressing" — omitted for the main ingredient list */
  title?: string;
  items: string[];
}

export interface DirectionGroup {
  /** e.g. "Maple Cinnamon Roasted Pecans" or "Plating" — omitted for the main directions */
  title?: string;
  steps: string[];
}

export interface HealthNote {
  title: string;
  text: string;
}

export interface Recipe {
  slug: string;
  title: string;
  /** Alternate name given on the recipe page, when present */
  subtitle?: string;
  category: CategoryLabel;
  categorySlug: CategorySlug;
  image: string;
  intro?: string;
  ingredients: IngredientGroup[];
  directions: DirectionGroup[];
  healthNotes: HealthNote[];
  outro?: string;
  time?: string;
  servings?: string;
  difficulty?: string;
}

export const recipeCategories: RecipeCategory[] = [
  { slug: "breakfast", label: "Breakfast" },
  { slug: "lunch", label: "Lunch" },
  { slug: "dinner", label: "Dinner" },
  { slug: "salad", label: "Salad" },
  { slug: "sweet-endings", label: "Sweet Endings" },
];

export const recipes: Recipe[] = [
  {
    slug: "organic-blackberry-frisee-fennel-salad-with-crumbled-goat-cheese-served-with-poached-chicken",
    title: "Organic Blackberry Frisée Fennel Salad with Crumbled Goat Cheese, Served with Poached Chicken",
    category: "Salad",
    categorySlug: "salad",
    image: "/images/recipes/organic-blackberry-frisee-fennel-salad-with-crumbled-goat-cheese-served-with-poached-chicken.jpg",
    ingredients: [
      {
        title: "For the Salad",
        items: [
          "4 cups frisée lettuce, torn into bite-sized pieces",
          "1 fennel bulb, thinly sliced",
          "1 cup fresh blackberries",
          "1/2 cup crumbled goat cheese",
        ],
      },
      {
        title: "For the Poached Chicken",
        items: [
          "4 boneless, skinless chicken breasts",
          "4 cups low-sodium chicken broth",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "2 sprigs fresh thyme",
          "Salt and pepper to taste",
        ],
      },
      {
        title: "For the Lemon Poppyseed Dressing",
        items: [
          "Juice of 1 lemon",
          "Zest of 1 lemon",
          "2 tablespoons honey or maple syrup",
          "2 tablespoons Dijon mustard",
          "2 tablespoons extra-virgin olive oil",
          "1 tablespoon poppyseeds",
          "Salt and pepper to taste",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "In a large salad bowl, combine the frisée lettuce, thinly sliced fennel, and fresh blackberries.",
          "In a small bowl, crumble the goat cheese and set aside.",
          "To poach the chicken, in a large pot, combine the low-sodium chicken broth, chopped onion, minced garlic, and fresh thyme sprigs. Season with salt and pepper.",
          "Bring the broth mixture to a gentle simmer over medium heat. Add the chicken breasts to the pot and poach them for about 15-20 minutes or until they reach an internal temperature of 165°F (74°C).",
          "Once the chicken is cooked, remove it from the poaching liquid and let it rest for a few minutes. Slice the chicken into thin strips.",
          "In a small bowl, whisk together the lemon juice, lemon zest, honey or maple syrup, Dijon mustard, extra-virgin olive oil, poppyseeds, salt, and pepper to make the lemon poppyseed dressing.",
          "Drizzle the lemon poppyseed dressing over the salad, tossing gently to coat the ingredients.",
          "Divide the dressed salad among four plates or bowls.",
          "Arrange the sliced poached chicken on top of each salad portion.",
          "Sprinkle the crumbled goat cheese over the salad.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Blackberries",
        text: "Blackberries are packed with antioxidants, vitamins, and minerals. They are a good source of dietary fiber and contain compounds that may support heart health, brain function, and healthy digestion. Incorporating blackberries into your diet can contribute to overall well-being.",
      },
    ],
    outro: "Serve the organic Blackberry Frisée Fennel Salad with Crumbled Goat Cheese alongside the poached chicken for a balanced and flavorful meal. The combination of crisp frisée lettuce, refreshing fennel, juicy blackberries, creamy goat cheese, and tender poached chicken creates a delightful harmony of textures and flavors. Drizzle the salad with the tangy and slightly sweet lemon poppyseed dressing to elevate the taste profile. Embrace the health benefits of blackberries as you enjoy this nourishing and delicious dish.",
    time: "25 Min",
    servings: "2",
    difficulty: "Easy",
  },
  {
    slug: "healthy-vegetarian-spring-rolls-with-wilted-swiss-chard-wrapping",
    title: "Healthy Vegetarian Spring Rolls with Wilted Swiss Chard Wrapping",
    category: "Lunch",
    categorySlug: "lunch",
    image: "/images/recipes/healthy-vegetarian-spring-rolls-with-wilted-swiss-chard-wrapping.jpg",
    ingredients: [
      {
        items: [
          "8 large Swiss chard leaves",
          "2 carrots, thinly sliced",
          "1 cucumber, thinly sliced",
          "Assorted colorful peppers, thinly sliced",
          "1 cup edamame",
          "2 tablespoons yellow toasted sesame seeds",
          "1 ripe mango, thinly sliced",
          "Almond butter",
          "Asian sauce for dipping (store-bought or homemade)",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Prepare the Swiss chard leaves by removing the stems and washing them thoroughly. Pat them dry with a kitchen towel.",
          "Bring a large pot of water to a boil. Carefully place the Swiss chard leaves into the boiling water and blanch them for about 1-2 minutes, or until they become slightly wilted and pliable.",
          "Remove the Swiss chard leaves from the boiling water and transfer them to a bowl of ice water to cool. This will help retain their vibrant green color and stop the cooking process. Once cooled, gently pat them dry with a kitchen towel.",
          "Lay a Swiss chard leaf flat on a clean work surface. Place a few slices of carrots, cucumber, assorted colorful peppers, edamame, toasted sesame seeds, and mango on the leaf.",
          "Roll the Swiss chard leaf tightly, starting from one end and tucking in the sides as you go. Repeat this step with the remaining Swiss chard leaves and filling ingredients.",
          "Prepare the almond butter Asian-inspired sauce for dipping by whisking together almond butter and your choice of Asian-inspired sauce (such as soy sauce, tamari, or hoisin sauce) in a small bowl. Adjust the consistency and flavor to your preference by adding a little water or lime juice if desired.",
          "Serve the vegetarian spring rolls with the almond butter Asian-inspired sauce for dipping.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Swiss Chard Leaves",
        text: "Swiss chard leaves offer several benefits as a wrapper for spring rolls. They are a nutrient-dense vegetable rich in vitamins A, C, and K, as well as antioxidants and minerals. Swiss chard leaves provide a low-calorie, gluten-free, and nutrient-packed alternative to rice paper wrappers.",
      },
    ],
    outro: "Enjoy the refreshing and nutritious vegetarian spring rolls, wrapped in wilted Swiss chard leaves and filled with an array of colorful vegetables, edamame, and juicy mango. The Swiss chard leaves provide an added dose of vitamins and minerals, making them a healthy alternative to traditional rice paper wrappers. Dip the spring rolls into the almond butter Asian-inspired sauce for a delightful burst of flavor. Embrace this vibrant and wholesome dish as a light and satisfying meal.",
    time: "30 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "rainbow-carrot-and-white-fish-over-arugula",
    title: "Rainbow Carrot and White Fish over Arugula",
    category: "Lunch",
    categorySlug: "lunch",
    image: "/images/recipes/rainbow-carrot-and-white-fish-over-arugula.jpg",
    ingredients: [
      {
        items: [
          "4 wild halibut or grouper fillets",
          "Sea salt and pepper, to taste",
          "Organic avocado oil (for cooking)",
          "4 rainbow carrots, julienned",
          "2 tablespoons avocado oil (for sautéing)",
          "2 cloves garlic, finely chopped",
          "Zest of 1 lemon",
          "Juice of 1 lemon",
          "4 cups arugula (for serving)",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat the oven to 400°F (200°C).",
          "Season the halibut or grouper fillets with sea salt and pepper on both sides.",
          "Heat a drizzle of organic avocado oil in an oven-safe skillet over medium-high heat. Once the oil is hot, add the seasoned fish fillets to the skillet.",
          "Sear the fish for about 2-3 minutes on each side until it develops a golden crust.",
          "Transfer the skillet to the preheated oven and bake for an additional 6-8 minutes, or until the fish is cooked through and flakes easily with a fork.",
          "While the fish is baking, heat 2 tablespoons of avocado oil in a separate skillet over medium heat. Add the julienned rainbow carrots and sauté for about 4-5 minutes, or until they are slightly tender but still crisp.",
          "Add the finely chopped garlic to the carrots and continue sautéing for another minute until fragrant.",
          "Remove the carrots from the heat and toss them with the lemon zest and lemon juice.",
          "Arrange a bed of arugula on individual serving plates or bowls.",
          "Place a cooked fish fillet on top of the arugula bed.",
          "Spoon the sautéed rainbow carrots with garlic over the fish.",
          "Serve the rainbow carrot and white fish dish immediately.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Wild Fish",
        text: "Choosing wild-caught fish over farmed fish can offer several benefits. Wild fish generally have a higher omega-3 fatty acid content, are typically lower in contaminants, and contribute to the preservation of wild fisheries. Opting for sustainably sourced and wild-caught fish supports the health of our oceans and ecosystems.",
      },
    ],
    outro: "Enjoy the beautiful combination of tender white fish, flavorful rainbow carrots, and the peppery kick of arugula. The quick sautéed rainbow carrots with garlic and lemon zest add brightness and crunch to the dish. Savor the benefits of choosing wild-caught fish, supporting sustainable fisheries, and enjoying a delicious and nutritious meal.",
    time: "35 Min",
    servings: "2",
    difficulty: "Easy",
  },
  {
    slug: "italian-mixed-green-salad-with-prosciutto-wrapped-asparagus",
    title: "Italian Mixed Green Salad with Prosciutto-Wrapped Asparagus",
    category: "Salad",
    categorySlug: "salad",
    image: "/images/recipes/italian-mixed-green-salad-with-prosciutto-wrapped-asparagus.jpg",
    ingredients: [
      {
        title: "For the Salad",
        items: [
          "8 cups assorted organic mixed greens",
          "Fresh basil leaves",
          "Fresh oregano leaves",
          "Cherry tomatoes, halved",
          "Mozzarella balls made from pasture-raised and grass-fed cows",
          "16 asparagus spears",
          "8 slices of prosciutto",
        ],
      },
      {
        title: "For Dressing and Finishing",
        items: [
          "First cold-pressed organic extra-virgin olive oil",
          "Balsamic glaze (store-bought or homemade)",
          "Freshly cracked pepper",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 400°F (200°C).",
          "Prepare the asparagus by washing and trimming the tough ends. Pat them dry with a paper towel.",
          "Take one slice of prosciutto and wrap it tightly around two asparagus spears. Repeat this step with the remaining prosciutto and asparagus.",
          "Place the prosciutto-wrapped asparagus on a baking sheet lined with parchment paper. Bake in the preheated oven for about 10-12 minutes, or until the asparagus is tender and the prosciutto is crispy.",
          "In a large bowl, combine the mixed greens, fresh basil leaves, fresh oregano leaves, cherry tomatoes, and mozzarella balls.",
          "Drizzle the salad with first cold-pressed organic extra-virgin olive oil and balsamic glaze according to taste.",
          "Gently toss the salad to coat the ingredients with the dressing.",
          "Transfer the salad to individual serving plates or bowls.",
          "Once the prosciutto-wrapped asparagus is done baking, remove them from the oven and let them cool slightly.",
          "Place two prosciutto-wrapped asparagus on top of each salad portion.",
          "Finish the salad with a sprinkle of freshly cracked pepper.",
        ],
      },
    ],
    healthNotes: [],
    outro: "Enjoy the delightful combination of fresh mixed greens, fragrant basil and oregano leaves, juicy cherry tomatoes, creamy mozzarella balls, and the savory crunch of prosciutto-wrapped asparagus. The first cold-pressed organic extra-virgin olive oil and balsamic glaze drizzle add a classic Italian touch to the salad. Indulge in this vibrant and flavorful dish as a refreshing and satisfying meal. Note: You can customize the amount of dressing and toppings according to your personal preferences. Feel free to adjust and add additional ingredients like olives or Parmesan cheese for more flavor variations.",
    time: "20 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "kale-cherry-salad",
    title: "Kale Cherry Salad",
    category: "Salad",
    categorySlug: "salad",
    image: "/images/recipes/kale-cherry-salad.jpg",
    ingredients: [
      {
        items: [
          "4 cups sliced purple kale",
          "1 cup shredded red cabbage",
          "1/2 cup dried cherries",
          "1/4 cup sliced red onions",
          "Maple cinnamon roasted pecans (see instructions below)",
        ],
      },
      {
        title: "For Dressing",
        items: [
          "Lightly salted water",
          "Organic extra-virgin first-pressed olive oil",
          "Balsamic glaze (store-bought or homemade)",
        ],
      },
      {
        title: "Maple Cinnamon Roasted Pecans",
        items: [
          "1 cup pecan halves",
          "1 tablespoon maple syrup",
          "1/2 teaspoon ground cinnamon",
          "Pinch of salt",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "In a large bowl, place the sliced purple kale and shredded red cabbage.",
          "Fill the bowl with lightly salted water, enough to cover the kale and cabbage. Let them soak for about 5 minutes.",
          "Drain the water from the bowl and gently squeeze the kale and cabbage to remove excess moisture.",
          "Drizzle the kale and cabbage with organic extra-virgin first-pressed olive oil. Massage the leaves for about 5 minutes, working the oil into the kale. This process helps break down the fibers and makes the kale more tender and easier to digest.",
          "Add the dried cherries, sliced red onions, and maple cinnamon roasted pecans to the bowl. Toss gently to combine all the ingredients.",
          "Drizzle the salad with balsamic glaze according to taste. The glaze adds a tangy and slightly sweet flavor to the salad.",
          "Serve the kale cherry salad as a refreshing and nutritious dish.",
        ],
      },
      {
        title: "Maple Cinnamon Roasted Pecans",
        steps: [
          "Preheat the oven to 350°F (175°C).",
          "In a small bowl, mix together the maple syrup, ground cinnamon, and pinch of salt.",
          "Add the pecan halves to the bowl and toss until they are evenly coated with the mixture.",
          "Spread the coated pecans on a baking sheet lined with parchment paper.",
          "Roast the pecans in the preheated oven for about 10-12 minutes, or until they are fragrant and slightly golden. Be sure to stir them halfway through to prevent burning.",
          "Remove the pecans from the oven and let them cool before adding them to the salad.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Red Cabbage",
        text: "Red cabbage is a nutrient-rich vegetable that offers numerous health benefits. It is an excellent source of vitamins C and K, dietary fiber, and antioxidants. Consuming red cabbage may support heart health, aid digestion, and promote a strong immune system.",
      },
    ],
    outro: "Enjoy the vibrant and flavorful Kale Cherry Salad, featuring the beautiful combination of purple kale, red cabbage, dried cherries, red onions, and maple cinnamon roasted pecans. The light salting and massaging of the kale, along with the balsamic glaze, elevate the taste and texture of the salad. Embrace the health benefits of red cabbage while indulging in this delicious and nutritious dish.",
    time: "25 Min",
    servings: "2",
    difficulty: "Easy",
  },
  {
    slug: "refreshing-romaine-and-artichoke-salad",
    title: "Refreshing Romaine and Artichoke Salad",
    category: "Salad",
    categorySlug: "salad",
    image: "/images/recipes/refreshing-romaine-and-artichoke-salad.jpg",
    ingredients: [
      {
        title: "For the Salad",
        items: [
          "1 head romaine lettuce, chopped",
          "1 can artichoke hearts, drained and quartered",
          "1 cup sprouted garbanzo beans (see instructions below)",
          "1 cup yellow tomatoes, halved",
          "1 cup colorful bell peppers, thinly sliced",
        ],
      },
      {
        title: "For the Italian Herb Dressing",
        items: [
          "1/4 cup first-pressed organic extra-virgin olive oil",
          "2 tablespoons red wine vinegar",
          "1 teaspoon dried oregano",
          "1 teaspoon dried basil",
          "1 teaspoon dried thyme",
          "1 teaspoon dried parsley",
          "1 clove garlic, minced",
          "Salt and freshly cracked pepper to taste",
        ],
      },
      {
        title: "For Finishing",
        items: [
          "Cracked pepper and sea salt to taste",
        ],
      },
    ],
    directions: [
      {
        title: "Sprouting Garbanzo Beans",
        steps: [
          "Rinse 1 cup of dried garbanzo beans thoroughly under cold water.",
          "Place the rinsed beans in a bowl and cover them with water, ensuring there is enough water to allow them to expand.",
          "Soak the beans overnight, or for at least 8 hours.",
          "Drain the soaked beans and rinse them once again.",
          "Place the beans in a sprouting jar or a sprouting tray/bag.",
          "Allow the beans to sprout by rinsing and draining them twice a day. Keep them in a warm, dark place, away from direct sunlight.",
          "After about 2-3 days, the garbanzo beans should have sprouts that are about 1/4 to 1/2 inch long. Rinse them one final time before using in the salad.",
        ],
      },
      {
        title: "The Salad and Dressing",
        steps: [
          "In a large bowl, combine the chopped romaine lettuce, quartered artichoke hearts, sprouted garbanzo beans, yellow tomatoes, and thinly sliced colorful bell peppers.",
          "In a separate small bowl, whisk together the first-pressed organic extra-virgin olive oil, red wine vinegar, dried oregano, dried basil, dried thyme, dried parsley, minced garlic, salt, and freshly cracked pepper to make the Italian Herb Dressing.",
          "Drizzle the Italian Herb Dressing over the salad and toss gently to coat all the ingredients.",
          "Sprinkle some cracked pepper and sea salt on top for added flavor.",
          "Serve the refreshing romaine and artichoke salad with sprouted garbanzo beans, yellow tomatoes, and colorful peppers immediately.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Sprouted Garbanzo Beans",
        text: "Sprouting garbanzo beans can enhance their nutritional profile by increasing the availability of certain nutrients and reducing anti-nutrients. Sprouted garbanzo beans are a good source of plant-based protein, dietary fiber, vitamins, minerals, and enzymes. They are also easier to digest compared to their non-sprouted counterparts.",
      },
    ],
    outro: "Enjoy the vibrant combination of crisp romaine lettuce, tender artichoke hearts, sprouted garbanzo beans, sweet yellow tomatoes, and colorful peppers. The homemade Italian Herb Dressing elevates the flavors with its herbaceous and tangy profile. Sprouting garbanzo beans adds nutritional benefits and a pleasant crunch to the salad. Indulge in this refreshing and nutritious dish as a light and satisfying meal. Note: Ensure that the sprouted garbanzo beans are fresh, clean, and free from any off odors or signs of spoilage before using them in the salad.",
    time: "15 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "arugula-grapefruit-salad-with-lemon-honey-dressing",
    title: "Arugula Grapefruit Salad with Lemon Honey Dressing",
    category: "Salad",
    categorySlug: "salad",
    image: "/images/recipes/arugula-grapefruit-salad-with-lemon-honey-dressing.jpg",
    ingredients: [
      {
        title: "For the Salad",
        items: [
          "4 cups arugula",
          "2 grapefruits, segmented",
          "1 cup broccoli sprouts",
          "1/2 cup thinly sliced red onions",
          "1/4 cup pomegranate seeds",
        ],
      },
      {
        title: "For the Lemon Honey Dressing",
        items: [
          "Zest of 1 lemon",
          "Juice of 1 lemon",
          "2 tablespoons honey",
          "2 tablespoons extra-virgin olive oil",
          "1 tablespoon chopped fresh mint",
          "Salt and pepper to taste",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "In a large bowl, combine the arugula, grapefruit segments, broccoli sprouts, thinly sliced red onions, and pomegranate seeds. Toss gently to mix the ingredients.",
          "In a separate small bowl, whisk together the lemon zest, lemon juice, honey, extra-virgin olive oil, chopped fresh mint, salt, and pepper until well combined.",
          "Drizzle the lemon honey dressing over the salad and toss gently to coat the ingredients evenly.",
          "Allow the salad to sit for a few minutes to let the flavors meld together.",
          "Divide the salad among four plates or bowls.",
          "Serve and enjoy the refreshing and vibrant arugula grapefruit salad with the tangy and sweet lemon honey dressing.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Arugula and Grapefruit",
        text: "Arugula is a nutrient-dense leafy green that is rich in vitamins A, C, and K. It also contains antioxidants and minerals like calcium and potassium. Grapefruit is high in vitamin C and dietary fiber, and it may promote healthy digestion and support immune function.",
      },
    ],
    outro: "Note: Feel free to adjust the amount of dressing according to personal preference. You can store any leftover dressing in the refrigerator for future use. Indulge in the combination of peppery arugula, tangy grapefruit, crunchy broccoli sprouts, and sweet pomegranate seeds. The lemon honey dressing adds a zesty and slightly sweet note that enhances the flavors of the salad. Enjoy the nourishing benefits of arugula and grapefruit in this refreshing and nutritious dish.",
    time: "15 Min",
    servings: "2",
    difficulty: "Easy",
  },
  {
    slug: "baked-lemon-greek-chicken-with-coconut-yogurt-tzatziki-sauce",
    title: "Baked Lemon Greek Chicken with Coconut Yogurt Tzatziki Sauce",
    category: "Lunch",
    categorySlug: "lunch",
    image: "/images/recipes/baked-lemon-greek-chicken-with-coconut-yogurt-tzatziki-sauce.jpg",
    ingredients: [
      {
        title: "For the Baked Lemon Greek Chicken",
        items: [
          "4 organic pasture-raised chicken breast",
          "Assorted colorful onions, thinly sliced",
          "Juice of 1 lemon",
          "2 tablespoons avocado oil",
          "1 teaspoon dried oregano",
          "Salt and pepper to taste",
        ],
      },
      {
        title: "For the Coconut Yogurt Tzatziki Sauce",
        items: [
          "1 cup coconut yogurt",
          "1/2 cucumber, grated and squeezed to remove excess moisture",
          "1 tablespoon fresh dill, chopped",
          "1 clove garlic, minced",
          "1 tablespoon lemon juice",
          "Salt and pepper to taste",
        ],
      },
      {
        title: "For Serving",
        items: [
          "Simple mixed greens",
          "Extra-virgin olive oil",
          "Sea salt and freshly cracked pepper",
          "1 large tomato, cut into quarters",
          "Assorted olives (optional)",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 375°F (190°C).",
          "In a bowl, combine the sliced onions, lemon juice, avocado oil, dried oregano, salt, and pepper. Mix well.",
          "Place the chicken breasts in a baking dish. Pour the marinade over the chicken, making sure each breast is well coated. Let it marinate for about 30 minutes.",
          "Bake the chicken in the preheated oven for approximately 20-25 minutes, or until the internal temperature reaches 160°F (71°C). Remove from the oven and let the chicken rest for a few minutes until it reaches 165°F (74°C) for perfect tenderness.",
          "While the chicken is baking, prepare the coconut yogurt tzatziki sauce. In a bowl, combine the coconut yogurt, grated cucumber, chopped dill, minced garlic, lemon juice, salt, and pepper. Mix well until all the ingredients are incorporated. Adjust the seasoning according to taste.",
          "For serving, arrange a bed of simple mixed greens on each plate. Drizzle the greens with extra-virgin olive oil and sprinkle with sea salt and freshly cracked pepper. Place a quartered tomato on the side and drizzle with additional olive oil. Add assorted olives if desired.",
          "Slice the baked lemon Greek chicken and place it on top of the mixed greens. Serve with a generous dollop of coconut yogurt tzatziki sauce.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Organic Coconut Yogurt",
        text: "Organic coconut yogurt is a dairy-free alternative that offers several benefits. It contains beneficial probiotics for gut health, is rich in healthy fats, and can be enjoyed by individuals with dairy-related sensitivities or following a vegan lifestyle.",
      },
    ],
    outro: "Enjoy the flavorful Baked Lemon Greek Chicken with the creamy and tangy Coconut Yogurt Tzatziki Sauce. The dish is complemented by a bed of fresh mixed greens and a juicy tomato. The use of coconut yogurt as a dairy-free alternative adds a creamy and satisfying element while accommodating those with dairy-related sensitivities.",
    time: "45 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "watermelon-rose-sorbet",
    title: "Watermelon Rose Sorbet",
    category: "Sweet Endings",
    categorySlug: "sweet-endings",
    image: "/images/recipes/watermelon-rose-sorbet.jpg",
    ingredients: [
      {
        items: [
          "1/2 organic seedless watermelon, cut into chunks",
          "Edible red or pink rose petals",
          "1 tablespoon lemon juice",
          "1-2 tablespoons organic local honey (adjust to taste)",
        ],
      },
      {
        title: "For Serving and Toppings",
        items: [
          "Additional edible flowers for decoration",
          "Organic 70% or darker chocolate (optional)",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Place the watermelon chunks in a single layer on a baking sheet lined with parchment paper. Place the sheet in the freezer and freeze the watermelon chunks for at least 3-4 hours, or until completely frozen.",
          "Once the watermelon chunks are frozen, remove them from the freezer and let them sit at room temperature for a few minutes to slightly soften.",
          "In a food processor, combine the frozen watermelon chunks, a handful of rose petals, lemon juice, and honey. Process until smooth and creamy.",
          "Taste the mixture and adjust the sweetness with more honey if desired.",
          "Divide the sorbet mixture into serving cups or bowls. You can also use hollowed-out watermelon shells as serving vessels for a fun presentation.",
          "Place the sorbet-filled cups or bowls back in the freezer and freeze for another 2-3 hours, or until firm.",
          "Before serving, decorate each sorbet cup with additional edible flowers for an extra touch of beauty.",
          "Optionally, serve the watermelon rose sorbet with a side of organic 70% or darker chocolate for a delightful contrast in flavors.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Watermelon",
        text: "Watermelon is not only hydrating due to its high water content, but it also provides various health benefits. It is a good source of vitamins A and C, and it contains lycopene, an antioxidant that may promote heart health and help protect against certain types of cancer.",
      },
    ],
    outro: "Enjoy the refreshing and vibrant Watermelon Rose Sorbet, which combines the natural sweetness of watermelon with the delicate floral essence of rose petals. It's a perfect dessert to cool down and indulge in during the warm summer days while benefiting from the hydrating properties and essential vitamins of watermelon. Note: Remember to use edible rose petals that are specifically meant for culinary purposes and have not been treated with any chemicals or pesticides.",
    time: "20 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "poached-pears-in-saffron-sauce",
    title: "Poached Pears in Saffron Sauce",
    category: "Sweet Endings",
    categorySlug: "sweet-endings",
    image: "/images/recipes/poached-pears-in-saffron-sauce.jpg",
    ingredients: [
      {
        items: [
          "4 ripe pears",
          "A pinch of saffron threads",
          "2 cups unsweetened pear or apple juice",
          "2 cups cardamom tea (brewed from cardamom pods and hot water)",
        ],
      },
      {
        title: "For Plating",
        items: [
          "Edible flower petals (such as rose petals or pansies)",
          "Freshly roasted pistachio nuts, crushed",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Peel the pears, leaving the stems intact if desired. Cut a thin slice from the bottom of each pear so that they can stand upright.",
          "In a large saucepan, combine the pear or apple juice, cardamom tea, and a pinch of saffron threads. Bring the mixture to a gentle simmer over medium heat.",
          "Carefully place the pears into the simmering liquid, ensuring they are fully submerged. If needed, add a bit more liquid to cover the pears completely.",
          "Poach the pears in the liquid for about 20-30 minutes, or until they are tender when pierced with a fork. The exact cooking time will depend on the ripeness of the pears.",
          "Once the pears are cooked, carefully remove them from the liquid and set them aside. Keep the poaching liquid in the saucepan.",
          "Increase the heat to medium-high and allow the poaching liquid to simmer and reduce until it thickens into a lovely sauce consistency. This should take around 10-15 minutes.",
          "While the sauce is reducing, slice the edible flower petals and crush the roasted pistachio nuts.",
          "To plate the dish, spoon the saffron sauce onto individual serving plates. Place a poached pear in the center of each plate.",
          "Sprinkle the sliced edible flower petals and crushed roasted pistachio nuts over the poached pears for added visual appeal and flavor.",
          "Serve the poached pears warm or chilled, with the saffron sauce and garnishes.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Saffron",
        text: "Saffron not only adds a beautiful golden color to dishes but also offers health benefits. It is rich in antioxidants, can help improve mood, and has been used traditionally for its potential anti-inflammatory and antidepressant properties. Additionally, saffron has a rich history and has been prized as a luxurious spice for centuries.",
      },
    ],
    outro: "Enjoy the delightful combination of tender poached pears, fragrant saffron sauce, and the added crunch of roasted pistachio nuts. The edible flower petals not only provide a lovely touch but also add a delicate floral essence to the dish. Savor this elegant dessert that showcases the beauty and flavors of saffron. Note: Remember to handle saffron with care, as it is a precious spice. A little goes a long way in terms of both flavor and color enhancement.",
    time: "30 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "lavender-lemon-almond-shortbread-cookies",
    title: "Lavender Lemon Almond Shortbread Cookies",
    category: "Sweet Endings",
    categorySlug: "sweet-endings",
    image: "/images/recipes/lavender-lemon-almond-shortbread-cookies.jpg",
    ingredients: [
      {
        title: "For the Cookies",
        items: [
          "2 cups almond flour",
          "2 large eggs",
          "2 tablespoons lavender flowers",
          "2 tablespoons fresh lemon juice",
          "1 tablespoon lemon zest",
          "2 tablespoons grass-fed butter, melted",
        ],
      },
      {
        title: "For the Healthy Lemon Drizzle",
        items: [
          "1/4 cup fresh lemon juice",
          "1/4 cup powdered erythritol or any preferred natural sweetener",
        ],
      },
      {
        title: "For Finishing Touches",
        items: [
          "Edible lavender flowers (optional)",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 350°F (175°C) and line a baking sheet with parchment paper.",
          "In a mixing bowl, combine almond flour, eggs, lavender flowers, lemon juice, lemon zest, and melted grass-fed butter. Mix well until a dough forms.",
          "Scoop out tablespoon-sized portions of the dough and roll them into balls. Place the dough balls on the prepared baking sheet and flatten them slightly with your palm or the bottom of a glass.",
          "Bake the cookies in the preheated oven for 10-12 minutes, or until the edges are lightly golden brown.",
          "While the cookies are baking, prepare the healthy lemon drizzle. In a small bowl, whisk together the fresh lemon juice and powdered erythritol (or your preferred sweetener) until smooth and well combined.",
          "Once the cookies are done, remove them from the oven and let them cool on a wire rack for a few minutes.",
          "Drizzle the healthy lemon drizzle over the cooled cookies using a spoon or a piping bag.",
          "Sprinkle edible lavender flowers over the cookies for a beautiful finishing touch and a subtle floral flavor.",
          "Allow the drizzle to set before serving the cookies.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Fun Fact",
        text: "Including edible flowers in your diet and on the plate can add a touch of beauty and a unique flavor experience. Lavender flowers, in particular, bring a delicate floral aroma and taste to dishes.",
      },
    ],
    outro: "Enjoy these delightful Lavender Lemon Cookies as a sweet treat with a hint of floral elegance. The healthy lemon drizzle adds a tangy touch while keeping the sweetness in check. It's a perfect addition to your afternoon tea or as a light dessert option.",
    time: "40 Min",
    servings: "12",
    difficulty: "Easy",
  },
  {
    slug: "fresh-strawberries-and-pineapple-slices-drizzled-in-dark-chocolate",
    title: "Fresh Strawberries and Pineapple Slices Drizzled in Dark Chocolate",
    category: "Sweet Endings",
    categorySlug: "sweet-endings",
    image: "/images/recipes/fresh-strawberries-and-pineapple-slices-drizzled-in-dark-chocolate.jpg",
    intro: "Indulge in the luxurious taste of fresh, organic fruits drizzled in dark chocolate with this simple, healthful recipe. Perfect for a delightful dessert or a sweet snack, this recipe serves four, providing the digestive benefits of pineapple along with the antioxidant-rich goodness of dark chocolate.",
    ingredients: [
      {
        items: [
          "2 cups of fresh organic strawberries, hulled and halved",
          "1 ripe organic pineapple, peeled, cored, and sliced",
          "1 bar of organic dark chocolate (70% or higher; Theo’s is a recommended brand)",
          "1/2 cup of organic coconut flakes, toasted",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Arrange the sliced strawberries and pineapple on a serving platter.",
          "In a heatproof bowl set over a pot of gently simmering water, melt the dark chocolate bar. Ensure that the bottom of the bowl doesn't touch the water to avoid overheating the chocolate.",
          "Once melted, drizzle the dark chocolate generously over the arranged fruits.",
          "Sprinkle the toasted coconut flakes over the top for an added crunchy texture and a delightful flavor contrast.",
          "Serve immediately and enjoy this healthy, delectable dessert.",
        ],
      },
    ],
    healthNotes: [],
    outro: "Pineapple, in addition to being deliciously sweet and tangy, provides a significant amount of bromelain, a digestive enzyme that aids in breaking down proteins and can facilitate healthier digestion. This makes pineapple a perfect finish to any meal. The strawberries bring a pop of color and an extra dose of vitamins and antioxidants. The dark chocolate not only enhances the taste but also offers health benefits, thanks to its high antioxidant content. Topping it off, coconut flakes add a tropical twist, along with fiber and healthy fats. This dish is a true celebration of taste and nutrition! Enjoy!",
    time: "15 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "fresh-strawberries-and-pineapple-slices-drizzled-in-dark-chocolate-2",
    title: "Fresh Strawberries and Pineapple Slices Drizzled in Dark Chocolate",
    subtitle: "Dark Chocolate Drizzled Fruit Platter with Toasted Coconut",
    category: "Sweet Endings",
    categorySlug: "sweet-endings",
    image: "/images/recipes/fresh-strawberries-and-pineapple-slices-drizzled-in-dark-chocolate-2.jpg",
    ingredients: [
      {
        items: [
          "1 pint organic strawberries, sliced",
          "1 small pineapple, peeled, cored, and sliced",
          "4 ounces organic dark chocolate (70% or higher cocoa content)",
          "Organic coconut flakes, toasted",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Wash the strawberries and remove the stems. Slice them into thin rounds.",
          "Peel the pineapple, remove the core, and slice it into bite-sized pieces or spears.",
          "In a microwave-safe bowl or double boiler, melt the dark chocolate until smooth and creamy. If using a microwave, heat the chocolate in 20-second intervals, stirring in between, until fully melted.",
          "Place the sliced fruit on a serving platter.",
          "Drizzle the melted dark chocolate over the sliced fruit. You can use a spoon or a piping bag for more precise drizzling.",
          "Sprinkle the toasted coconut flakes over the fruit and chocolate.",
          "Serve the dark chocolate-drizzled fruit platter as a refreshing and indulgent dessert or snack.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Importance of Using Organic Fruit",
        text: "Using organic fruit ensures that you are avoiding exposure to synthetic pesticides and chemicals. Organic farming practices promote environmental sustainability and can contribute to better soil health and biodiversity.",
      },
      {
        title: "Health Benefits of Pineapple",
        text: "Pineapple is not only delicious but also offers several health benefits. It contains an enzyme called bromelain, which aids in digestion by breaking down proteins and reducing inflammation. Pineapple is also a good source of vitamin C, manganese, and dietary fiber.",
      },
    ],
    outro: "The dark chocolate drizzle adds a touch of richness to the vibrant fruit platter, while the toasted coconut flakes provide a delightful crunch. It's a perfect finish to any meal and a healthier alternative to processed desserts. Enjoy this beautiful and flavorful combination of organic fruit, dark chocolate, and toasted coconut flakes for a satisfying and nutritious treat.",
    time: "20 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "ginger-lemon-turmeric-immunity-shots",
    title: "Orange, Lemon, Ginger, Turmeric, Cayenne Pepper, Coconut Shots",
    subtitle: "Morning Immune Boosting Lemon-Ginger Shots",
    category: "Breakfast",
    categorySlug: "breakfast",
    image: "/images/recipes/ginger-lemon-turmeric-immunity-shots.jpg",
    ingredients: [
      {
        items: [
          "2 small oranges, peeled. (Omit and add 2 lemons for less sweetness!)",
          "8 lemons, peels removed",
          "3-4 small fingers of turmeric, roughly chopped",
          "5-6 fingers chopped fresh ginger no need to peel!)",
          "1/8 tsp fresh black pepper",
          "1 TBSP tsp oil (such as extra virgin, flax, or MCT oil to help improve turmeric absorption)",
          "1 1/2 cup organic coconut water",
          "Dash of cayenne pepper. (Or more if you like a good kick!)",
          "Optional: Pure organic maple syrup to add more sweetness. A little goes a long way.",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Juice the oranges and lemons, followed by the ginger and turmeric.",
          "Add 1/2 cup of coconut water to the juicer to drain remaining ginger and turmeric juices.",
          "Now pour the ingredients into a pitcher and add remaining 1 cup coconut water, ground pepper, cayenne pepper and maple syrup to taste.",
          "Place Wellness Juice in 4-6 ounce containers, and drink first thing in the morning, shortly after you have had your first full glass of pure water.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Benefits of Ingredients",
        text: "Lemons are rich in vitamin C, which supports the immune system and aids digestion. Ginger has anti-inflammatory properties and can help with digestion and nausea. Turmeric contains curcumin, a powerful antioxidant and anti-inflammatory compound. Cayenne pepper may boost metabolism and improve circulation. Cinnamon has antioxidant and anti-inflammatory properties and can help regulate blood sugar.",
      },
      {
        title: "Benefits",
        text: "Starting your day with this immune-boosting shot provides a concentrated dose of vitamin C from lemons, which supports a healthy immune system and digestion. Ginger aids digestion, reduces inflammation, and can help settle the stomach. Turmeric offers its powerful antioxidant and anti-inflammatory benefits to promote overall health and well-being. Cayenne pepper may boost metabolism, improve blood circulation, and provide a mild kick to wake up your system. Cinnamon helps regulate blood sugar levels and adds a delicious flavor to the shot.",
      },
    ],
    outro: "These morning shots are a quick and effective way to give your immune system a boost, jumpstart your day, and provide hydration to your body. Cheers to a healthy start!",
    time: "10 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "butternut-squash-cabbage",
    title: "Butternut Squash Cabbage",
    category: "Dinner",
    categorySlug: "dinner",
    image: "/images/recipes/butternut-squash-cabbage.jpg",
    ingredients: [
      {
        items: [
          "1 small butternut squash, peeled, seeded, and cubed",
          "4 cups green cabbage, thinly sliced",
          "2 apples, cored and sliced",
          "4 healthy chicken sausages (e.g., Blinsky's caseless lemon chicken sausages)",
          "2 tablespoons chopped fresh sage",
          "Olive oil",
          "Salt and pepper to taste",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 400°F (200°C).",
          "On a baking sheet, spread out the cubed butternut squash in a single layer. Drizzle with olive oil and sprinkle with salt and pepper. Toss to coat evenly. Roast in the preheated oven for 25-30 minutes or until the squash is tender and lightly browned.",
          "Meanwhile, heat a large skillet over medium heat. Add a drizzle of olive oil and sauté the sliced green cabbage until it begins to soften, about 5 minutes. Season with salt and pepper to taste.",
          "Push the sautéed cabbage to one side of the skillet and add the sliced apples. Cook for an additional 2-3 minutes, until the apples are slightly softened.",
          "In another skillet, cook the chicken sausages according to the package instructions until they are browned and cooked through.",
          "Once the butternut squash is roasted, remove it from the oven and transfer it to the skillet with the cabbage and apples. Add the chopped sage and gently toss everything together to combine. Cook for an additional 2 minutes to allow the flavors to meld.",
          "Slice the cooked chicken sausages into bite-sized pieces and add them to the skillet with the vegetables. Toss gently to combine.",
          "Taste and adjust the seasoning if needed.",
          "Serve the roasted butternut squash, green cabbage, apples, and chicken sausage mixture in bowls or on plates. Enjoy the delicious blend of sweet and savory flavors.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Nutritional Benefits",
        text: "Green cabbage is low in calories and high in fiber, vitamin C, and vitamin K. It also contains antioxidants and has potential anti-inflammatory properties. Butternut squash is packed with nutrients like vitamins A, C, and E, as well as dietary fiber. It also provides a good amount of potassium and antioxidants.",
      },
    ],
    outro: "This satisfying meal combines the sweetness of roasted butternut squash with the savory flavors of green cabbage, apples, and chicken sausage. The blend of flavors creates a delightful balance that will please your taste buds.",
    time: "35 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "spinach-artichoke-heart-goat-cheese-and-spinach-stuffed-chicken-prosciutto-rolls",
    title: "Spinach, Artichoke Heart, Goat Cheese, and Spinach Stuffed Chicken Prosciutto Rolls",
    subtitle: "Goat Cheese and Spinach Stuffed Chicken Pinwheels with Prosciutto",
    category: "Dinner",
    categorySlug: "dinner",
    image: "/images/recipes/spinach-artichoke-heart-goat-cheese-and-spinach-stuffed-chicken-prosciutto-rolls.jpg",
    ingredients: [
      {
        items: [
          "4 organic chicken breasts",
          "1 cup organic frozen spinach, thawed and drained",
          "4 ounces goat cheese",
          "2 cloves garlic, minced",
          "1/4 cup diced onion",
          "1 tablespoon chopped rosemary",
          "4 slices prosciutto",
          "Kitchen rope or cooking pins for securing",
        ],
      },
      {
        title: "For Lemon Chicken Sauce",
        items: [
          "1/4 cup chicken broth",
          "2 tablespoons lemon juice",
          "1 tablespoon butter",
          "Salt and pepper to taste",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 375°F (190°C).",
          "In a mixing bowl, combine the thawed spinach, goat cheese, minced garlic, diced onion, and chopped rosemary. Mix well until all ingredients are evenly incorporated.",
          "Pound each chicken breast to an even thickness, about 1/4 inch. This helps the chicken cook more evenly and makes it easier to roll.",
          "Spread a generous amount of the goat cheese and spinach filling onto each chicken breast, leaving a small border around the edges.",
          "Roll up each chicken breast tightly, starting from one end. Wrap a slice of prosciutto around each rolled chicken breast, securing the filling inside.",
          "Use kitchen rope or cooking pins to tie or secure the chicken breasts to hold their shape during cooking.",
          "Heat a large oven-safe skillet over medium-high heat. Add a bit of oil or butter to the skillet and sear the chicken pinwheels on all sides until golden brown.",
          "Transfer the skillet with the seared chicken pinwheels to the preheated oven. Bake for 20-25 minutes or until the chicken is cooked through and reaches an internal temperature of 165°F (74°C).",
          "While the chicken is baking, prepare the lemon chicken sauce. In a small saucepan, combine chicken broth, lemon juice, butter, salt, and pepper. Heat over medium heat until the butter has melted and the sauce is warmed through.",
          "Once the chicken is cooked, remove it from the oven and let it rest for a few minutes. Remove the kitchen rope or pins before serving.",
          "Drizzle the lemon chicken sauce over the chicken pinwheels or serve it on the side for dipping.",
        ],
      },
    ],
    healthNotes: [],
    outro: "Note: This recipe requires a bit more time and effort, but the result is a wonderfully elegant and delicious dish that is perfect for special occasions. Enjoy the flavorful chicken pinwheels with the creamy goat cheese and spinach filling, wrapped in savory prosciutto, and complemented by the tangy lemon chicken sauce.",
    time: "45 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "shrimp-lime-cakes-with-guacamole-and-pineapple-cilantro-salsa",
    title: "Shrimp Lime Cakes with Guacamole and Pineapple Cilantro Salsa",
    subtitle: "Colorful Wild Shrimp Cakes with Pineapple Salsa",
    category: "Dinner",
    categorySlug: "dinner",
    image: "/images/recipes/shrimp-lime-cakes-with-guacamole-and-pineapple-cilantro-salsa.jpg",
    ingredients: [
      {
        items: [
          "1 pound wild-caught shrimp, peeled and deveined",
          "1/4 cup finely chopped yellow pepper",
          "1/4 cup finely chopped red pepper",
          "1/4 cup finely chopped orange pepper",
          "2 scallions, finely chopped",
          "2 cloves garlic, minced",
          "1 egg, lightly beaten",
          "1/4 cup almond flour",
          "Salt and pepper to taste",
          "Avocado oil, for pan frying",
        ],
      },
      {
        title: "For Pineapple Salsa",
        items: [
          "1 cup fresh pineapple, diced",
          "1/4 cup finely chopped cilantro",
          "2 tablespoons finely chopped red onion",
          "1 tablespoon lime juice",
          "Salt to taste",
        ],
      },
      {
        title: "For Sautéed Mixed Peppers",
        items: [
          "2 mixed bell peppers, sliced",
          "1 tablespoon avocado oil",
          "Salt and pepper to taste",
        ],
      },
      {
        title: "For Baked Black Beans",
        items: [
          "2 cups cooked black beans",
          "1 jalapeño, seeded and finely chopped",
          "1/4 cup diced onion",
          "1 clove garlic, minced",
          "1/2 teaspoon cumin",
          "1/2 teaspoon paprika",
          "Salt and pepper to taste",
          "1/4 cup vegetable broth",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "In a food processor, pulse the shrimp until coarsely chopped. Transfer to a large mixing bowl.",
          "To the bowl with shrimp, add the finely chopped yellow, red, and orange peppers, scallions, minced garlic, beaten egg, almond flour, salt, and pepper. Mix well to combine.",
          "Form the shrimp mixture into patties, approximately 2 inches in diameter.",
          "Heat avocado oil in a skillet over medium heat. Add the shrimp cakes and cook for 3-4 minutes on each side until golden brown and cooked through. Ensure the internal temperature reaches 145°F (63°C).",
          "Meanwhile, prepare the pineapple salsa by combining diced pineapple, chopped cilantro, red onion, lime juice, and salt in a bowl. Mix well and set aside.",
          "In another skillet, heat avocado oil over medium heat. Add sliced mixed peppers and sauté until tender-crisp. Season with salt and pepper.",
          "For the baked black beans, preheat your oven to 350°F (175°C). In an oven-safe dish, combine cooked black beans, chopped jalapeño, diced onion, minced garlic, cumin, paprika, salt, pepper, and vegetable broth. Stir to combine. Bake for 20-25 minutes, until the flavors meld together.",
          "Serve the colorful shrimp cakes over a bed of sautéed mixed peppers. Top with pineapple salsa and accompany with a side of baked black beans.",
        ],
      },
    ],
    healthNotes: [
      {
        title: "Nutrition Benefits",
        text: "Wild shrimp is a lean source of protein and provides essential nutrients such as selenium, vitamin B12, and omega-3 fatty acids. Pineapple salsa offers a dose of vitamin C, manganese, and bromelain, which may aid digestion and reduce inflammation. Mixed peppers are rich in antioxidants, vitamin C, and dietary fiber. Black beans are a good source of plant-based protein, fiber, iron, and folate, supporting heart health and digestion.",
      },
    ],
    outro: "This meal provides a nice balance of protein, healthy fats, and carbohydrates, offering a satisfying and nutritious dining experience. Enjoy!",
    time: "30 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "festive-high-protien-deviled-eggs",
    title: "Festive High-Protein Deviled Eggs",
    category: "Lunch",
    categorySlug: "lunch",
    image: "/images/recipes/festive-high-protien-deviled-eggs.jpg",
    intro: "Treat yourself to a protein-packed, flavorful lunch with this festive deviled eggs recipe. Using organic eggs from pasture-raised, regenerative farmed chickens and nutrient-dense Greek yogurt, this dish is as wholesome as it is delicious. The recipe serves four, perfect for a family lunch or a small get-together.",
    ingredients: [
      {
        items: [
          "8 eggs from pasture-raised, regenerative farmed chickens",
          "1/2 cup of organic Greek yogurt or coconut yogurt",
          "1 tablespoon of Dijon mustard",
          "Zest of 1 lemon",
          "Sea salt and pepper to taste",
          "2 radishes, thinly sliced",
          "2 slices of prosciutto, sautéed and crumbled",
          "Edible flowers for garnish",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Place the eggs in a saucepan and cover with water. Bring to a boil, then reduce the heat and let simmer for 9-12 minutes.",
          "Drain the eggs and immediately plunge them into ice water to cool. This will make them easier to peel.",
          "Once cooled, peel the eggs and slice them in half lengthwise. Carefully remove the yolks and place them in a mixing bowl.",
          "To the bowl with the yolks, add the Greek yogurt, Dijon mustard, and lemon zest. Season with sea salt and pepper. Mix until smooth and creamy.",
          "Spoon or pipe the yolk mixture back into the egg whites.",
          "Garnish each deviled egg with thinly sliced radishes, crumbled prosciutto, and edible flowers.",
          "Serve immediately, or refrigerate until ready to serve.",
        ],
      },
    ],
    healthNotes: [],
    outro: "The benefits of using eggs from pasture-raised, regenerative farmed chickens are plenty. These eggs are often higher in nutrients like Vitamin A, Vitamin E, and Omega-3 fatty acids compared to conventional eggs. Plus, by choosing these eggs, you're supporting farming practices that are sustainable and kind to the environment. Enjoy this high-protein, flavorful lunch knowing that you're nourishing your body with the very best nature has to offer!",
    time: "25 Min",
    servings: "6",
    difficulty: "Easy",
  },
  {
    slug: "baked-chicken-in-cherry-rosemary-sauce",
    title: "Baked Chicken in Cherry Rosemary Sauce",
    category: "Dinner",
    categorySlug: "dinner",
    image: "/images/recipes/baked-chicken-in-cherry-rosemary-sauce.jpg",
    intro: "Enjoy a burst of flavors with this healthy and delightful recipe featuring organic ingredients. It serves four, making it perfect for a family dinner or a small gathering.",
    ingredients: [
      {
        items: [
          "4 organic chicken breasts",
          "Salt and pepper to taste",
          "2 tablespoons of organic coconut oil",
          "1 cup of fresh organic cherries, pitted and halved",
          "2 sprigs of fresh organic rosemary, plus extra for garnish",
          "1/2 cup of organic chicken broth",
          "2 tablespoons of balsamic glaze",
          "Aluminum foil",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 375°F (190°C).",
          "Season the chicken breasts generously with salt and pepper.",
          "In a large oven-safe skillet, heat the coconut oil over medium heat.",
          "Once the oil is hot, add the chicken breasts to the skillet. Sear each side for about 3-4 minutes until golden brown, then remove them from the skillet and set aside.",
          "In the same skillet, add the cherries, rosemary, and chicken broth. Let the mixture simmer for a couple of minutes until the cherries start to soften.",
          "Return the chicken breasts to the skillet, spooning some of the cherry-rosemary mixture over the top of each piece.",
          "Cover the skillet with aluminum foil and place it in the preheated oven.",
          "Bake for 20-25 minutes, or until the chicken is cooked through and no longer pink in the middle.",
          "Drizzle each chicken breast with balsamic glaze, garnish with extra rosemary sprigs, and serve immediately.",
        ],
      },
    ],
    healthNotes: [],
    outro: "This baked chicken in cherry rosemary sauce not only looks appealing but also packs a nutritional punch. Organic ingredients ensure that you're getting all the goodness nature intended, while the coconut oil and balsamic glaze provide healthy fats and a sweet, tangy finish. Enjoy this delicious and wholesome meal with your loved ones!",
    time: "40 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "organic-sourdough-spinach-and-chicken-panini",
    title: "Organic Sourdough, Spinach, and Chicken Panini",
    category: "Lunch",
    categorySlug: "lunch",
    image: "/images/recipes/organic-sourdough-spinach-and-chicken-panini.jpg",
    intro: "Delight in this delectable Organic Sourdough, Spinach, and Chicken Panini. The sourdough bread, a product of natural fermentation, brings not only a tangy flavor but also an array of health benefits. Made with grass-fed ghee, this recipe serves four, perfect for a healthy family lunch or an intimate gathering with friends.",
    ingredients: [
      {
        items: [
          "8 slices of organic sourdough bread",
          "Organic pasture-raised chicken breasts",
          "2 large tomatoes sliced thick",
          "2 cups of fresh organic spinach",
          "2 cloves of garlic, finely chopped",
          "Juice and zest of 1 lemon",
          "A sprig of fresh thyme",
          "Salt and pepper to taste",
          "Grass-fed ghee for sautéing and spreading",
          "Pecorino cheese",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Begin with the lemon poached chicken. Place the chicken breasts in a saucepan, add water just enough to cover the chicken. Add the thyme, half the lemon zest, and some salt. Bring to a boil, then reduce heat and let it simmer for 15-20 minutes until the chicken is cooked through. Remove the chicken, let it cool, then shred it.",
          "While the chicken is cooling, heat a teaspoon of ghee in a skillet over medium heat. Add the garlic and sauté until it becomes fragrant. Add the spinach and cook until just wilted. Stir in the lemon juice, the rest of the zest, and season with salt and pepper.",
          "Spread a thin layer of ghee on one side of each slice of sourdough bread. On the other side of four slices, evenly distribute the chicken, sautéed spinach,  tomatoes and cheese. Top with the remaining slices of bread, ghee side up.",
          "Cook the sandwiches in a Panini press or on a griddle until the bread is toasted and everything is heated through, about 3-5 minutes.",
          "Serve the Paninis warm.",
        ],
      },
    ],
    healthNotes: [],
    outro: "The sourdough bread in this recipe is a fermented food that brings unique health benefits. It is more easily digestible than regular bread due to the fermentation process, which breaks down some of the gluten and antinutrients. It also has a lower glycemic index, which means it won't spike blood sugar levels as much as non-fermented breads. Additionally, sourdough bread contains probiotics and prebiotics that contribute to a healthy gut microbiome. Grass-fed ghee, a form of clarified butter, contributes a rich, buttery flavor to this recipe. Ghee is a healthy fat that offers anti-inflammatory properties and a high concentration of vitamins A and E. Enjoy this savory, hearty, and nutritious Panini, where every ingredient contributes to your wellness and gastronomic satisfaction!",
    time: "20 Min",
    servings: "2",
    difficulty: "Easy",
  },
  {
    slug: "avocado-cacao-pudding-with-coconut-milk-with-cream",
    title: "Avocado Cacao Pudding with Coconut Milk and Cream",
    category: "Sweet Endings",
    categorySlug: "sweet-endings",
    image: "/images/recipes/avocado-cacao-pudding-with-coconut-milk-with-cream.jpg",
    intro: "Savor the unique blend of flavors and health benefits in this Creamy Avocado and Cacao Pudding with Coconut Milk. Packed with healthy fats from avocado and filled with antioxidants from cacao, this dessert is as wholesome as it is delicious.",
    ingredients: [
      {
        items: [
          "2 ripe avocados",
          "1/4 cup of raw cacao powder",
          "1/4 cup of pure maple syrup",
          "1/2 cup of full-fat coconut milk",
          "1 teaspoon of pure vanilla extract",
          "A pinch of sea salt",
          "Coconut cream for topping (optional)",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Start by halving and pitting the avocados. Use a spoon to scoop out the flesh and place it in a blender or food processor.",
          "Add the cacao powder, maple syrup, coconut milk, vanilla extract, and a pinch of sea salt to the blender.",
          "Blend until the mixture is smooth and creamy. You might need to scrape down the sides a few times to ensure everything is well combined.",
          "Once the pudding is at your desired consistency, scoop it into four dessert bowls or glasses.",
          "Place 5 washed and dried raspberries on top of whipped cream. (Option: use coconut whipped cream instead of classic whipped cream)",
          "Chill the pudding in the refrigerator for at least an hour before serving to allow it to set.",
          "Before serving, top each pudding with a dollop of coconut cream if desired.",
        ],
      },
    ],
    healthNotes: [],
    outro: "This Creamy Avocado and Cacao Pudding is a treat that lets you indulge while still taking care of your health. The avocados provide healthy monounsaturated fats and a host of vitamins and minerals. The cacao is full of antioxidants and adds a deep, rich chocolate flavor without the need for processed sugars. Lastly, the coconut milk and cream contribute to the pudding's velvety texture while adding another layer of healthful fats. Enjoy this nutrient-dense dessert knowing it's doing good for your body while satisfying your sweet tooth!",
    time: "10 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "breakfast-spinach-omelette-with-broccoli-bacon-and-goat-cheeses",
    title: "Breakfast Spinach Omelette with Broccoli, Bacon, and Goat Cheese",
    category: "Breakfast",
    categorySlug: "breakfast",
    image: "/images/recipes/breakfast-spinach-omelette-with-broccoli-bacon-and-goat-cheeses.jpg",
    intro: "Start your day right with this nutrient-packed Breakfast Spinach Omelette filled with broccoli, bacon, and goat cheese. Whipping the eggs longer gives a fluffier texture to your omelette, and lightly steaming the broccoli beforehand makes it more easily digestible. This recipe serves four, making it perfect for busy weekday mornings.",
    ingredients: [
      {
        items: [
          "8 pasteurized eggs",
          "2 cups of organic spinach",
          "1 cup of steamed broccoli florets",
          "1/2 cup of crumbled goat cheese",
          "4 strips of bacon (optional)",
          "Salt and pepper to taste",
          "Olive oil for cooking",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "If using, cook the bacon in a pan until crispy. Remove and set aside to cool, then crumble.",
          "In the same pan, lightly sauté the spinach just until wilted. Remove and set aside.",
          "Steam the broccoli florets lightly until they turn a vibrant green. This step helps make the broccoli more easily digestible.",
          "In a bowl, crack the eggs and season with salt and pepper. Whip the eggs longer than you typically would – this introduces more air into the eggs, resulting in a fluffier omelette.",
          "Heat a bit of olive oil in a non-stick pan over medium heat. Pour in a quarter of the egg mixture, allowing it to set slightly.",
          "On one half of the omelette, place a quarter of the spinach, steamed broccoli, goat cheese, and crumbled bacon. Once the omelette is almost set, fold the empty half over the filling.",
          "Cook for another minute or two, then slide the omelette onto a plate.",
          "Repeat with the remaining ingredients to make four omelettes in total.",
        ],
      },
    ],
    healthNotes: [],
    outro: "These omelettes can be made ahead and stored in the fridge for a convenient, grab-and-go breakfast throughout the week. Each bite is filled with the goodness of vegetables, the richness of goat cheese, and, for meat lovers, the savory crunch of bacon. This recipe brings together taste, health, and convenience in a single dish – a perfect start to any busy day. Enjoy!",
    time: "20 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "breakfast-organic-egg-muffin-cups-with-assorted-vegetables",
    title: "Breakfast Organic Egg Muffin Cups with Assorted Vegetables",
    category: "Breakfast",
    categorySlug: "breakfast",
    image: "/images/recipes/breakfast-organic-egg-muffin-cups-with-assorted-vegetables.jpg",
    intro: "Enjoy a protein-packed, veggie-filled breakfast with these Organic Egg Muffin Cups. Made with pasture-raised eggs, cream, and an assortment of vegetables, these breakfast muffins are a convenient and nutritious start to your day. They are perfect for busy individuals and families and can be made in large batches and frozen for later use.",
    ingredients: [
      {
        items: [
          "8 pasture-raised eggs",
          "1/4 cup of cream",
          "1 cup of baby Portobello mushrooms, diced",
          "1 cup of diced tomatoes",
          "1 cup of spinach or kale, roughly chopped",
          "1/2 cup of grated Pecorino cheese",
          "Salt and pepper to taste",
          "Olive oil for greasing",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 375°F (190°C). Grease the muffin tins with a bit of olive oil to prevent sticking.",
          "In a skillet over medium heat, sauté the mushrooms, tomatoes, and spinach or kale until the vegetables are tender and the excess moisture has evaporated.",
          "In a large bowl, whisk together the eggs, cream, salt, and pepper until well combined.",
          "Divide the sautéed vegetables evenly among the greased muffin cups.",
          "Pour the egg mixture over the vegetables in each muffin cup, filling each about 3/4 of the way.",
          "Sprinkle the top of each egg muffin with the grated Pecorino cheese.",
          "Bake for 20-25 minutes or until the eggs are set and the cheese is lightly browned and bubbly.",
          "Let the muffins cool for a few minutes in the muffin tin before removing them. Serve warm.",
        ],
      },
    ],
    healthNotes: [],
    outro: "These Breakfast Organic Egg Muffin Cups are an excellent option for those mornings when time is of the essence. They can be made in advance and frozen, providing a ready-to-go healthy breakfast option. Simply reheat in the microwave or oven when ready to eat. Packed with proteins from eggs and a bounty of nutrients from vegetables, these egg muffin cups make a delicious, convenient, and healthy start to any day. Enjoy!",
    time: "30 Min",
    servings: "6",
    difficulty: "Easy",
  },
  {
    slug: "gut-loving-papaya-pineapple-boats",
    title: "Gut-Loving Papaya Pineapple Boats",
    category: "Breakfast",
    categorySlug: "breakfast",
    image: "/images/recipes/gut-loving-papaya-pineapple-boats.jpg",
    intro: "This Breakfast Gut-Loving Papaya Pineapple Boats recipe is not just a feast for your taste buds but also a feast for your health. These delicious fruit boats pack a nutritional punch, with pineapple and papaya providing digestive enzyme benefits, and mint leaves adding a refreshing flavor and additional health benefits.",
    ingredients: [
      {
        items: [
          "2 large Maradol papayas (or any other large variety), halved and seeds removed",
          "1 ripe pineapple, peeled and cored",
          "1 handful of fresh mint leaves, finely chopped",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Cut the pineapple into bite-sized chunks.",
          "Fill each papaya boat with the pineapple chunks.",
          "Sprinkle chopped mint leaves on top of the pineapple-filled papaya boats for an added fresh taste.",
          "Serve immediately and enjoy this refreshing, gut-loving breakfast.",
        ],
      },
    ],
    healthNotes: [],
    outro: "Both pineapple and papaya are rich in digestive enzymes - bromelain and papain respectively - that aid in breaking down proteins and improving digestion. These enzymes can help heal and protect the gut, assisting the body's natural digestive process. Moreover, these fruits are excellent sources of vitamins and minerals, including vitamin C, vitamin A, folate, and potassium, making them incredibly beneficial for overall health. Mint, in addition to providing a fresh flavor, offers its own health benefits. It is well known for its ability to soothe digestive issues and reduce inflammation. These Papaya Pineapple Boats are simple to prepare, pleasing to the eyes, and a joy to eat, making them a perfect start to your day. Enjoy the refreshing taste and the digestive benefits that come with it.",
    time: "10 Min",
    servings: "2",
    difficulty: "Easy",
  },
  {
    slug: "gluten-free-pumpkin-pancakes-with-pecans",
    title: "Gluten-Free Pumpkin Pancakes with Pecans",
    category: "Breakfast",
    categorySlug: "breakfast",
    image: "/images/recipes/gluten-free-pumpkin-pancakes-with-pecans.jpg",
    intro: "Delight your taste buds with these light, fluffy, and gluten-free Pumpkin Pancakes topped with roasted cinnamon maple pecans. Made with wholesome ingredients, this breakfast dish serves four and offers a satisfying start to your day.",
    ingredients: [
      {
        items: [
          "2 cups of almond flour",
          "4 large eggs",
          "3 tablespoons of pure maple syrup, plus extra for drizzling",
          "1 teaspoon of cinnamon, plus extra for sprinkling",
          "1 cup of organic canned pumpkin or fresh mashed pumpkin",
          "Coconut oil for cooking",
          "1 cup of pecans",
          "Ghee or coconut oil for roasting pecans",
          "Vanilla coconut yogurt for serving",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "In a large bowl, combine the almond flour, eggs, 3 tablespoons of maple syrup, 1 teaspoon of cinnamon, and pumpkin. Stir until the mixture is well combined and forms a thick batter.",
          "Heat a large non-stick pan over medium heat and add a spoonful of coconut oil.",
          "Pour 1/4 cup of the batter onto the pan for each pancake. Cook until bubbles appear on the surface, then flip and cook until the other side is golden brown. Repeat with the remaining batter, adding more coconut oil as needed.",
          "While the pancakes are cooking, prepare the roasted pecans. Preheat your oven to 350 degrees F (175 degrees C). Toss the pecans in a mixture of melted ghee (or coconut oil), a dash of cinnamon, and a drizzle of maple syrup. Spread the pecans out on a baking sheet and roast for about 10 minutes, until fragrant and slightly darker.",
          "Once roasted, remove the pecans from the oven and let them cool before chopping.",
        ],
      },
      {
        title: "Plating",
        steps: [
          "Serve the pancakes warm. Top each serving with a dollop of vanilla coconut yogurt, a sprinkling of chopped roasted pecans, and a generous drizzle of organic maple syrup. Enjoy this nutrient-packed, gluten-free breakfast that's as delightful to eat as it is to prepare.",
        ],
      },
    ],
    healthNotes: [],
    outro: "These pancakes combine the health benefits of pumpkin (high in vitamin A and fiber), almond flour (a great source of protein and healthy fats), and eggs (packed with protein and various essential nutrients) to provide a nutritious start to your day. The pecans add a crunchy texture and are an excellent source of monounsaturated fats and fiber. Lastly, the cinnamon not only enhances the flavor but also has anti-inflammatory and antioxidant benefits. Enjoy!",
    time: "25 Min",
    servings: "4",
    difficulty: "Easy",
  },
  {
    slug: "vibrant-beet-and-pomegranate-juice",
    title: "Vibrant Beet and Pomegranate Juice",
    category: "Breakfast",
    categorySlug: "breakfast",
    image: "/images/recipes/vibrant-beet-and-pomegranate-juice.jpg",
    intro: "Kick-start your day with a refreshing, nutrition-packed Beet and Pomegranate Juice. With the unique combination of red beets, pomegranate juice, ginger, coconut water, cinnamon, cayenne, and lemons, this invigorating juice serves four and provides numerous health benefits.",
    ingredients: [
      {
        items: [
          "4 medium-sized organic red beets, peeled",
          "1 cup of pure pomegranate juice",
          "2 inches of fresh ginger root",
          "2 cups of coconut water",
          "1 teaspoon of ground cinnamon",
          "A pinch of cayenne pepper",
          "2 lemons",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Cut the beets and ginger root into pieces that will easily fit into your juicer.",
          "Peel the lemons and cut them into quarters.",
          "Place the beets, ginger, and lemons into the juicer and juice them.",
          "Pour the freshly extracted juice into a pitcher.",
          "Add the pomegranate juice and coconut water to the pitcher and stir well.",
          "Sprinkle in the cinnamon and cayenne pepper, then stir again to ensure the spices are well distributed.",
          "Pour into glasses and serve immediately. Enjoy 4 ounces of this vibrant juice every morning, followed by pure water.",
        ],
      },
    ],
    healthNotes: [],
    outro: "Beets are known for their numerous health benefits, including reducing blood pressure, improving digestive health, and supporting brain health due to their high content of dietary nitrates and other powerful antioxidants. Pomegranate juice is lauded for its cancer-fighting properties, courtesy of its high antioxidant content, particularly punicalagin. It is also beneficial for heart health and can have anti-inflammatory effects. Ginger and lemon, on the other hand, provide digestive benefits, while coconut water is known for its hydrating properties. Cinnamon and cayenne offer additional health benefits such as blood sugar control and metabolic boost. This juice is not just healthful but is a true taste adventure with its combination of sweet, tangy, spicy, and refreshing flavors. Start your day with this nutrient-rich juice and give your body the nourishment it needs!",
    time: "10 Min",
    servings: "2",
    difficulty: "Easy",
  },
  {
    slug: "gluten-free-morning-sunshine-bread",
    title: "Gluten-Free Morning Sunshine Bread",
    category: "Breakfast",
    categorySlug: "breakfast",
    image: "/images/recipes/gluten-free-morning-sunshine-bread.jpg",
    intro: "Welcome the day with a slice of our Morning Sunshine Bread. This gluten-free delight, made with almond flour, eggs, and fresh orange juice, serves four and is sure to brighten your mornings.",
    ingredients: [
      {
        items: [
          "2 cups of almond flour",
          "4 large eggs",
          "1/3 cup of a healthy sweetener (like raw honey or pure maple syrup)",
          "1/2 cup of sunflower seeds",
          "Juice and zest of 2 oranges",
          "1/2 cup of melted coconut oil",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 350 degrees F (175 degrees C) and line a loaf pan with parchment paper.",
          "In a large bowl, combine the almond flour, eggs, sweetener, sunflower seeds, orange juice, orange zest, and melted coconut oil. Stir until the mixture is well combined.",
          "Pour the batter into the prepared loaf pan and spread it out evenly with a spatula.",
          "Bake for 40-45 minutes, or until the top is golden and a toothpick inserted into the center of the bread comes out clean.",
          "Allow the bread to cool in the pan for 10 minutes, then remove it from the pan and let it cool completely on a wire rack.",
          "Slice and serve your Morning Sunshine Bread. It's delicious as is or lightly toasted with a dollop of coconut butter.",
        ],
      },
    ],
    healthNotes: [],
    outro: "This gluten-free Morning Sunshine Bread is packed with health benefits. Almond flour is high in protein and heart-healthy fats, eggs are an excellent source of protein and vitamins, while oranges provide a healthy dose of Vitamin C and other antioxidants. The sunflower seeds not only add a satisfying crunch but are also a good source of healthy fats, fiber, and various vitamins and minerals. They contain high levels of Vitamin E, a powerful antioxidant that can help reduce inflammation in the body, and magnesium, which is crucial for bone health and energy production. Moreover, sunflower seeds are rich in selenium, a mineral that supports thyroid health and boosts immunity. Enjoy a slice of this bread for a nutritious start to your day or as a wholesome snack any time you need a little sunshine!",
    time: "50 Min",
    servings: "8",
    difficulty: "Easy",
  },
  {
    slug: "orange-olive-fennel-chicken-stew",
    title: "Orange Olive Fennel Chicken Stew",
    category: "Dinner",
    categorySlug: "dinner",
    image: "/images/recipes/orange-olive-fennel-chicken-stew.jpg",
    intro: "This heart-warming dish is not only pleasing to the palate but also beneficial to your health. It serves four and is a fantastic meal to enjoy on a cozy evening. Best of all, it freezes beautifully, so you can always have a delicious and nutritious meal at hand.",
    ingredients: [
      {
        title: "For the stew",
        items: [
          "4 organic pasture-raised chicken breasts or thighs",
          "2 sliced fennel bulbs",
          "2 sliced yellow onions",
          "3 sliced carrots",
          "1 cup of green olives (Castelvetrano is a good choice)",
          "4 cups of chicken bone broth",
          "Juice and zest of 2 oranges",
        ],
      },
      {
        title: "For the cauliflower mashed potatoes",
        items: [
          "1 large head of cauliflower",
          "2 cloves of garlic",
          "2 tablespoons of fresh rosemary, finely chopped",
          "2 tablespoons of pasture-raised, grass-fed butter",
          "Salt and pepper to taste",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Start by making the stew. In a large pot, add the chicken, sliced fennel, onions, carrots, olives, chicken bone broth, and orange juice and zest. Bring to a boil, then reduce heat and let it simmer until the chicken is cooked through and the vegetables are tender.",
          "While the stew is simmering, start on your cauliflower mashed potatoes. Cut the cauliflower into florets and steam until tender.",
          "Once the cauliflower is tender, transfer it to a food processor. Add the garlic, rosemary, butter, salt, and pepper. Process until smooth.",
          "Serve the Orange Olive Fennel Chicken Stew over a bed of Cauliflower Mashed Potatoes. Enjoy!",
        ],
      },
    ],
    healthNotes: [],
    outro: "Cauliflower is a highly nutritious vegetable that is an excellent source of vitamins C and K, folate, and fiber. It is also low in calories and carbohydrates, making it a healthier alternative to potatoes for those watching their weight or blood sugar levels. The presence of sulfur-containing compounds in cauliflower contributes to its potential health benefits, including reducing the risk of heart diseases and various cancers. The antioxidant properties of cauliflower, combined with its fiber content, can support digestive health as well. This flavorful stew paired with cauliflower mashed potatoes is a fantastic way to enjoy a nutrient-dense, delicious meal without compromising on taste. Enjoy!",
    time: "45 Min",
    servings: "6",
    difficulty: "Easy",
  },
  {
    slug: "dijon-chicken-burgers-with-peppers",
    title: "Dijon Chicken Burgers with Peppers",
    category: "Dinner",
    categorySlug: "dinner",
    image: "/images/recipes/dijon-chicken-burgers-with-peppers.jpg",
    intro: "This colorful, protein-rich, and nutrient-dense dish serves four. It's an incredibly tasty way to enjoy organic, pasture-raised chicken, with the added benefits of fresh vegetables and a kick of Dijon mustard.",
    ingredients: [
      {
        items: [
          "1 lb organic, pasture-raised ground chicken",
          "1 medium zucchini, grated",
          "1/4 cup chopped parsley",
          "2 cloves garlic, chopped",
          "1 medium onion, chopped",
          "Sea salt and pepper to taste",
          "Assorted baby peppers, cut into thin slices",
          "Dijon mustard to taste",
          "8 slices sunshine bread",
          "Organic spinach for serving",
        ],
      },
    ],
    directions: [
      {
        steps: [
          "Preheat your oven to 375°F (190°C) or preheat your Panini grill.",
          "In a large bowl, combine the ground chicken, grated zucchini, parsley, garlic, onion, sea salt, and pepper. Mix well.",
          "Form the mixture into four equal patties and place them on a baking sheet or directly onto the preheated Panini grill.",
          "Bake or grill the burgers until they reach an internal temperature of 160°F (71°C). Remove from heat and let them rest until the internal temperature reads 165°F (74°C).",
          "While the burgers are resting, lightly sauté your baby peppers if desired, or you can leave them raw for a crunchy texture.",
          "Quickly sauté the organic spinach with a little sea salt and fresh cracked pepper until wilted.",
          "To serve, place a bed of sautéed spinach in the center of the plate. Add the chicken burger, decorate with sliced peppers, and dollop with Dijon mustard over the sunshine bread.",
        ],
      },
    ],
    healthNotes: [],
    outro: "This Dijon Chicken Burger recipe is not only mouth-wateringly delicious, but it also provides an array of vitamins, minerals, and proteins, making it a satisfying and healthy option for any meal. Enjoy!",
    time: "30 Min",
    servings: "4",
    difficulty: "Easy",
  },
];

export function getRecipe(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug);
}

export function getRecipesByCategory(categorySlug: CategorySlug): Recipe[] {
  return recipes.filter((r) => r.categorySlug === categorySlug);
}

export function getRelatedRecipes(recipe: Recipe, count = 3): Recipe[] {
  const sameCategory = recipes.filter(
    (r) => r.slug !== recipe.slug && r.categorySlug === recipe.categorySlug
  );
  const others = recipes.filter(
    (r) => r.slug !== recipe.slug && r.categorySlug !== recipe.categorySlug
  );
  return [...sameCategory, ...others].slice(0, count);
}
