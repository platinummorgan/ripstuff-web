/**
 * Viral Hashtag Generator for Virtual Graveyard
 * Generates category-specific and trending hashtags for maximum social media reach
 */

interface GraveData {
  title: string;
  category: string;
  eulogyText: string;
  createdAt: string;
  reactions?: {
    heart: number;
    candle: number;
    rose: number;
    lol: number;
  };
}

interface HashtagSet {
  primary: string[];        // Main hashtags (always include)
  trending: string[];       // Popular/viral hashtags
  categorySpecific: string[]; // Category-based hashtags
  brandSpecific: string[];  // Brand/item specific hashtags
}

export class ViralHashtagGenerator {
  private static readonly PRIMARY_HASHTAGS = [
    'RIPMyStuff',
    'VirtualGraveyard', 
    'MemorialMonday',
    'GoneButNotForgotten',
    'RestInPieces'
  ];

  private static readonly TRENDING_HASHTAGS = [
    'BrokenButLoved',
    'ItemFail',
    'TechGraveyard',
    'FashionFail',
    'ApplianceFail',
    'GadgetGraveyard',
    'ThingsThatDied',
    'ProductFail',
    'ItemRIP',
    'StuffGraveyard'
  ];

  private static readonly CATEGORY_HASHTAGS: Record<string, string[]> = {
    'TECH_GADGETS': [
      'TechFail', 'PhoneFail', 'GadgetDeath', 'TechGraveyard', 
      'ElectronicsFail', 'DeviceDeath', 'TechRIP', 'GadgetGrave',
      'SmartphoneFail', 'TechTragedy', 'DigitalDeath'
    ],
    'CLOTHING_FASHION': [
      'FashionFail', 'ClothingFail', 'FashionRIP', 'OutfitFail',
      'StyleFail', 'WardrobeFail', 'FashionGrave', 'ClothesRIP',
      'FashionTragedy', 'StyleGraveyard', 'OutfitRIP'
    ],
    'KITCHEN_APPLIANCES': [
      'KitchenFail', 'ApplianceFail', 'CookingFail', 'KitchenRIP',
      'ApplianceGrave', 'KitchenTragedy', 'CookingDisaster',
      'KitchenwareRIP', 'ApplianceDeath', 'CulinaryFail'
    ],
    'TOYS_GAMES': [
      'ToyFail', 'GameFail', 'ToyRIP', 'GamingFail',
      'PlaytimeFail', 'ToyGraveyard', 'GameOver', 'ToyTragedy',
      'GamingRIP', 'PlaysetFail', 'ToyDeath'
    ],
    'FURNITURE_DECOR': [
      'FurnitureFail', 'HomeDecorFail', 'FurnitureRIP', 'HomeDesignFail',
      'InteriorFail', 'FurnitureGrave', 'DecorDisaster', 'HomeFail',
      'FurnitureDeath', 'DecorRIP', 'HomewareRIP'
    ],
    'ELECTRONICS': [
      'ElectronicsFail', 'ElectronicsRIP', 'TechFail', 'DeviceFail',
      'ElectronicsGrave', 'CircuitFail', 'ElectronicDeath', 'WiredFail',
      'ElectronicsTragedy', 'PowerFail', 'ElectronicsGraveyard'
    ],
    'VEHICLES': [
      'CarFail', 'VehicleFail', 'AutoFail', 'CarRIP',
      'VehicleRIP', 'AutoRIP', 'CarTragedy', 'VehicleDeath',
      'AutoDeath', 'CarGraveyard', 'VehicleGraveyard'
    ],
    'BOOKS_MEDIA': [
      'BookFail', 'MediaFail', 'BookRIP', 'ReadingFail',
      'LiteratureFail', 'BookGrave', 'MediaRIP', 'BookDeath',
      'ReadingRIP', 'BookTragedy', 'MediaGraveyard'
    ],
    'SPORTS_FITNESS': [
      'SportsFail', 'FitnessFail', 'WorkoutFail', 'SportsRIP',
      'FitnessRIP', 'GymFail', 'ExerciseFail', 'AthleticFail',
      'SportsTragedy', 'FitnessGrave', 'WorkoutRIP'
    ],
    'BEAUTY_PERSONAL_CARE': [
      'BeautyFail', 'MakeupFail', 'BeautyRIP', 'CosmeticFail',
      'SkincareRIP', 'BeautyGrave', 'MakeupRIP', 'BeautyTragedy',
      'CosmeticRIP', 'BeautyDisaster', 'GroomingFail'
    ],
    'TOOLS_HARDWARE': [
      'ToolFail', 'ToolRIP', 'HardwareFail', 'ToolGrave',
      'WorkshopFail', 'ToolDeath', 'HardwareRIP', 'ToolTragedy',
      'ConstructionFail', 'RepairFail', 'ToolGraveyard'
    ],
    'PET_SUPPLIES': [
      'PetSuppliesFail', 'PetToyFail', 'PetRIP', 'PetSuppliesRIP',
      'PetGearFail', 'AnimalSuppliesFail', 'PetProductFail',
      'PetSuppliesGrave', 'PetItemRIP', 'PetGearRIP'
    ],
    'OUTDOOR_GARDEN': [
      'GardenFail', 'OutdoorFail', 'GardeningFail', 'YardFail',
      'LandscapeFail', 'GardenRIP', 'OutdoorRIP', 'GardenGrave',
      'YardworkFail', 'GardenTragedy', 'OutdoorGear'
    ],
    'OTHER': [
      'ItemFail', 'ThingRIP', 'ProductFail', 'StuffRIP',
      'ObjectFail', 'ItemGrave', 'ThingFail', 'ProductRIP',
      'ObjectRIP', 'ItemTragedy', 'StuffFail'
    ]
  };

  private static readonly BRAND_KEYWORDS: Record<string, string[]> = {
    // Tech Brands
    'iphone': ['Apple', 'iOS', 'iPhone'],
    'apple': ['Apple', 'Mac', 'iPad', 'iPhone'],
    'samsung': ['Samsung', 'Galaxy', 'Android'],
    'google': ['Google', 'Pixel', 'Android'],
    'microsoft': ['Microsoft', 'Windows', 'Xbox'],
    'nintendo': ['Nintendo', 'Switch', 'Gaming'],
    'sony': ['Sony', 'PlayStation', 'Electronics'],
    
    // Fashion Brands  
    'nike': ['Nike', 'Sneakers', 'Athletic'],
    'adidas': ['Adidas', 'Sneakers', 'Sports'],
    'levis': ['Levis', 'Denim', 'Jeans'],
    'zara': ['Zara', 'Fashion', 'FastFashion'],
    
    // Kitchen Brands
    'keurig': ['Keurig', 'Coffee', 'Kitchen'],
    'kitchenaid': ['KitchenAid', 'Kitchen', 'Appliances'],
    'ninja': ['Ninja', 'Blender', 'Kitchen'],
    
    // Generic Categories
    'phone': ['Smartphone', 'Mobile', 'CellPhone'],
    'laptop': ['Laptop', 'Computer', 'PC'],
    'headphones': ['Headphones', 'Audio', 'Music'],
    'shoes': ['Shoes', 'Footwear', 'Sneakers'],
    'jeans': ['Jeans', 'Denim', 'Pants'],
    'coffee': ['Coffee', 'Caffeine', 'Morning'],
  };

  /**
   * Generate viral hashtags for a grave/memorial
   */
  static generateHashtags(grave: GraveData, options?: {
    maxTotal?: number;
    includeBrandSpecific?: boolean;
    prioritizeTrending?: boolean;
  }): HashtagSet {
    const maxTotal = options?.maxTotal ?? 15;
    const includeBrandSpecific = options?.includeBrandSpecific ?? true;
    const prioritizeTrending = options?.prioritizeTrending ?? true;

    const result: HashtagSet = {
      primary: [...this.PRIMARY_HASHTAGS.slice(0, 3)], // Top 3 primary
      trending: [],
      categorySpecific: [],
      brandSpecific: []
    };

    // Add category-specific hashtags
    const categoryTags = this.CATEGORY_HASHTAGS[grave.category] || this.CATEGORY_HASHTAGS.OTHER;
    result.categorySpecific = categoryTags.slice(0, 4); // Top 4 category tags

    // Add trending hashtags
    if (prioritizeTrending) {
      result.trending = this.TRENDING_HASHTAGS.slice(0, 3);
    }

    // Add brand-specific hashtags if enabled
    if (includeBrandSpecific) {
      result.brandSpecific = this.extractBrandHashtags(grave.title.toLowerCase());
    }

    return result;
  }

  /**
   * Extract brand-specific hashtags from title
   */
  private static extractBrandHashtags(title: string): string[] {
    const hashtags: string[] = [];
    
    for (const [keyword, tags] of Object.entries(this.BRAND_KEYWORDS)) {
      if (title.includes(keyword)) {
        hashtags.push(...tags);
      }
    }

    return [...new Set(hashtags)]; // Remove duplicates
  }

  /**
   * Get flat array of hashtags for social media (with # prefix)
   */
  static getFormattedHashtags(grave: GraveData, options?: {
    maxCount?: number;
    platform?: 'twitter' | 'instagram' | 'facebook' | 'tiktok';
  }): string[] {
    const maxCount = options?.maxCount ?? 10;
    const platform = options?.platform ?? 'twitter';

    const hashtagSet = this.generateHashtags(grave, {
      maxTotal: maxCount,
      prioritizeTrending: platform === 'twitter' || platform === 'tiktok'
    });

    // Combine all hashtags
    const allHashtags = [
      ...hashtagSet.primary,
      ...hashtagSet.trending,
      ...hashtagSet.categorySpecific,
      ...hashtagSet.brandSpecific
    ];

    // Remove duplicates and limit count
    const uniqueHashtags = [...new Set(allHashtags)].slice(0, maxCount);

    // Format with # prefix
    return uniqueHashtags.map(tag => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`);
  }

  /**
   * Get hashtags as a single string for easy sharing
   */
  static getHashtagString(grave: GraveData, options?: {
    maxCount?: number;
    platform?: 'twitter' | 'instagram' | 'facebook' | 'tiktok';
  }): string {
    return this.getFormattedHashtags(grave, options).join(' ');
  }

  /**
   * Generate platform-specific hashtag recommendations
   */
  static getHashtagRecommendations(grave: GraveData): Record<string, string[]> {
    return {
      twitter: this.getFormattedHashtags(grave, { maxCount: 8, platform: 'twitter' }),
      instagram: this.getFormattedHashtags(grave, { maxCount: 15, platform: 'instagram' }),
      facebook: this.getFormattedHashtags(grave, { maxCount: 5, platform: 'facebook' }),
      tiktok: this.getFormattedHashtags(grave, { maxCount: 10, platform: 'tiktok' })
    };
  }

  /**
   * Get controversy-based hashtags for death certificates
   */
  static getControversyHashtags(controversyLevel: 'Saint' | 'Respected' | 'Divisive' | 'Controversial' | 'Roasted'): string[] {
    const controversyTags: Record<string, string[]> = {
      'Saint': ['Beloved', 'Cherished', 'Respected', 'Honored'],
      'Respected': ['WellLoved', 'Appreciated', 'Valued', 'Respected'],
      'Divisive': ['Controversial', 'Debated', 'Mixed', 'Divisive'],
      'Controversial': ['Controversial', 'Heated', 'Disputed', 'Polarizing'],
      'Roasted': ['Roasted', 'Savage', 'Brutal', 'NoMercy']
    };

    return controversyTags[controversyLevel]?.map(tag => `#${tag}`) || [];
  }
}