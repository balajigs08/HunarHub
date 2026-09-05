require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const Service = require('../models/Service');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const Cart = require('../models/Cart');

const config = require('../config/config');

const DEMO_IMAGES = {
  profiles: [
    'https://i.pravatar.cc/300?img=1', 'https://i.pravatar.cc/300?img=2', 'https://i.pravatar.cc/300?img=3',
    'https://i.pravatar.cc/300?img=4', 'https://i.pravatar.cc/300?img=5', 'https://i.pravatar.cc/300?img=6',
    'https://i.pravatar.cc/300?img=7', 'https://i.pravatar.cc/300?img=8', 'https://i.pravatar.cc/300?img=9',
    'https://i.pravatar.cc/300?img=10',
  ],
  products: [
    'https://picsum.photos/seed/pot1/400/300', 'https://picsum.photos/seed/shoe1/400/300',
    'https://picsum.photos/seed/cloth1/400/300', 'https://picsum.photos/seed/art1/400/300',
    'https://picsum.photos/seed/vend1/400/300', 'https://picsum.photos/seed/craft1/400/300',
    'https://picsum.photos/seed/tailor1/400/300', 'https://picsum.photos/seed/pottery2/400/300',
    'https://picsum.photos/seed/shoes2/400/300', 'https://picsum.photos/seed/fabric1/400/300',
  ],
};

const seed = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongoUri);
    }
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}), EntrepreneurProfile.deleteMany({}),
      Service.deleteMany({}), Product.deleteMany({}), Order.deleteMany({}),
      ServiceRequest.deleteMany({}), Review.deleteMany({}), Notification.deleteMany({}),
      Complaint.deleteMany({}), Cart.deleteMany({}),
    ]);

    // ===================== CATEGORIES =====================
    console.log('📂 Creating categories...');
    const categories = await Category.create([
      { name: 'Cobbler', description: 'Expert shoe repair and leather crafting services', icon: '👟', slug: 'cobbler' },
      { name: 'Potter (Kumhar)', description: 'Traditional pottery and clay art making', icon: '🏺', slug: 'potter-kumhar' },
      { name: 'Tailor', description: 'Custom clothing stitching and alterations', icon: '🧵', slug: 'tailor' },
      { name: 'Artisan', description: 'Handmade crafts, art and traditional artworks', icon: '🎨', slug: 'artisan' },
      { name: 'Small Vendor', description: 'Local vendors selling everyday goods and produce', icon: '🛒', slug: 'small-vendor' },
    ]);

    const [cobbler, potter, tailor, artisan, vendor] = categories;
    console.log('✅ Categories created:', categories.length);

    // ===================== ADMIN =====================
    console.log('👑 Creating admin account...');
    const admin = await User.create({
      name: 'Platform Admin',
      email: config.adminEmail,
      password: config.adminPassword,
      phone: '+91-9800000001',
      role: 'admin',
      location: { city: 'Delhi' },
    });

    // ===================== CUSTOMERS =====================
    console.log('👥 Creating customers...');
    const customerData = [
      { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91-9811111101', city: 'Delhi' },
      { name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '+91-9811111102', city: 'Mumbai' },
      { name: 'Anita Gupta', email: 'anita.gupta@example.com', phone: '+91-9811111103', city: 'Jaipur' },
      { name: 'Suresh Patel', email: 'suresh.patel@example.com', phone: '+91-9811111104', city: 'Ahmedabad' },
      { name: 'Meena Iyer', email: 'meena.iyer@example.com', phone: '+91-9811111105', city: 'Chennai' },
      { name: 'Arjun Singh', email: 'arjun.singh@example.com', phone: '+91-9811111106', city: 'Lucknow' },
      { name: 'Kavita Mehta', email: 'kavita.mehta@example.com', phone: '+91-9811111107', city: 'Pune' },
      { name: 'Deepak Joshi', email: 'deepak.joshi@example.com', phone: '+91-9811111108', city: 'Bhopal' },
      { name: 'Sunita Rao', email: 'sunita.rao@example.com', phone: '+91-9811111109', city: 'Hyderabad' },
      { name: 'Vikram Nair', email: 'vikram.nair@example.com', phone: '+91-9811111110', city: 'Kochi' },
      { name: 'Lalita Devi', email: 'lalita.devi@example.com', phone: '+91-9811111111', city: 'Patna' },
      { name: 'Mohit Aggarwal', email: 'mohit.aggarwal@example.com', phone: '+91-9811111112', city: 'Chandigarh' },
      { name: 'Rekha Bajaj', email: 'rekha.bajaj@example.com', phone: '+91-9811111113', city: 'Surat' },
      { name: 'Gaurav Tiwari', email: 'gaurav.tiwari@example.com', phone: '+91-9811111114', city: 'Agra' },
      { name: 'Shalini Mishra', email: 'shalini.mishra@example.com', phone: '+91-9811111115', city: 'Varanasi' },
    ];

    // Demo customer
    const demoCustomerUser = await User.create({
      name: 'Demo Customer',
      email: config.customerEmail,
      password: config.customerPassword,
      phone: '+91-9800000002',
      role: 'customer',
      location: { city: 'Delhi' },
    });

    const customers = await Promise.all(
      customerData.map((c) =>
        User.create({ ...c, password: 'Customer@12345', role: 'customer', location: { city: c.city } })
      )
    );
    const allCustomers = [demoCustomerUser, ...customers];
    console.log('✅ Customers created:', allCustomers.length);

    // ===================== ENTREPRENEUR USERS =====================
    console.log('🧑‍💼 Creating entrepreneur users...');
    const entrepreneurData = [
      {
        name: 'Ramesh Chamar', email: 'ramesh.chamar@example.com', phone: '+91-9822222201',
        city: 'Agra', businessName: 'Ramesh Shoe Works',
        category: cobbler._id, skills: ['Shoe Repair', 'Leather Stitching', 'Sole Replacement', 'Polish & Shine'],
        experience: { years: 15, description: 'Third generation cobbler with expertise in all types of footwear repair.' },
        about: 'I have been repairing shoes for over 15 years. My grandfather started this craft and I continue the tradition with modern techniques. I handle everything from basic repairs to custom leather work.',
        startingPrice: 50,
      },
      {
        name: 'Shyam Kumhar', email: 'shyam.kumhar@example.com', phone: '+91-9822222202',
        city: 'Jaipur', businessName: 'Shyam Pottery Studio',
        category: potter._id, skills: ['Wheel Throwing', 'Hand Building', 'Terracotta', 'Glazing', 'Decorative Pots'],
        experience: { years: 20, description: 'Traditional Kumhar family with 20+ years in pottery making.' },
        about: 'Our family has been making pottery for generations. We create beautiful terracotta and clay products using traditional Rajasthani techniques. Each piece is unique and handcrafted.',
        startingPrice: 200,
      },
      {
        name: 'Amina Khatoon', email: 'amina.khatoon@example.com', phone: '+91-9822222203',
        city: 'Lucknow', businessName: 'Amina Fashion Studio',
        category: tailor._id, skills: ['Salwar Kameez', 'Lehenga', 'Blouse', 'Alterations', 'Embroidery', 'Chikankari'],
        experience: { years: 12, description: 'Specializing in traditional Lucknawi chikankari embroidery work.' },
        about: 'I am a master tailor specializing in Lucknawi chikankari and traditional Indian wear. I have stitched outfits for hundreds of weddings and special occasions.',
        startingPrice: 300,
      },
      {
        name: 'Baldev Sharma', email: 'baldev.sharma@example.com', phone: '+91-9822222204',
        city: 'Varanasi', businessName: 'Baldev Weave & Craft',
        category: artisan._id, skills: ['Banarasi Weaving', 'Silk Work', 'Zari Work', 'Handloom'],
        experience: { years: 25, description: 'Expert weaver with mastery in Banarasi silk weaving.' },
        about: 'Coming from a family of weavers in Varanasi, I have dedicated my life to preserving the art of Banarasi silk weaving. Every piece takes days to complete but is a work of art.',
        startingPrice: 1500,
      },
      {
        name: 'Gita Devi', email: 'gita.devi@example.com', phone: '+91-9822222205',
        city: 'Jaipur', businessName: 'Gita Block Prints',
        category: artisan._id, skills: ['Block Printing', 'Natural Dyes', 'Textile Art', 'Fabric Design'],
        experience: { years: 10, description: 'Artisan specializing in Rajasthani block printing.' },
        about: 'I create beautiful hand block printed textiles using natural dyes and traditional wooden blocks. Each design tells a story of Rajasthani heritage.',
        startingPrice: 400,
      },
      {
        name: 'Rajan Verma', email: 'rajan.verma@example.com', phone: '+91-9822222206',
        city: 'Delhi', businessName: 'Delhi Master Tailor',
        category: tailor._id, skills: ['Suits', 'Sherwanis', 'Western Wear', 'Alterations', 'Embroidery'],
        experience: { years: 18, description: 'Expert tailor for both Indian and Western wear.' },
        about: 'With 18 years of experience in Delhi\'s fashion district, I specialize in creating perfect fits for both traditional and modern occasions.',
        startingPrice: 500,
      },
      {
        name: 'Kamla Bai', email: 'kamla.bai@example.com', phone: '+91-9822222207',
        city: 'Bhopal', businessName: 'Kamla Handicrafts',
        category: artisan._id, skills: ['Madhubani Painting', 'Folk Art', 'Decorative Items', 'Canvas Art'],
        experience: { years: 8, description: 'Folk artist specializing in Madhubani and Gond art.' },
        about: 'I paint traditional Madhubani and Gond art forms that have been passed down through generations. My art celebrates the rich cultural heritage of Central India.',
        startingPrice: 300,
      },
      {
        name: 'Suresh Lohar', email: 'suresh.lohar@example.com', phone: '+91-9822222208',
        city: 'Pune', businessName: 'Suresh Cobbler Corner',
        category: cobbler._id, skills: ['Shoe Repair', 'Heel Replacement', 'Stretching', 'Waterproofing'],
        experience: { years: 22, description: 'Second generation cobbler serving Pune for over 2 decades.' },
        about: 'I have been repairing and crafting footwear for 22 years in Pune. I work with all types of shoes - formal, casual, sports and traditional.',
        startingPrice: 60,
      },
      {
        name: 'Fatima Begum', email: 'fatima.begum@example.com', phone: '+91-9822222209',
        city: 'Hyderabad', businessName: 'Fatima Embroidery House',
        category: tailor._id, skills: ['Hyderabadi Embroidery', 'Zardozi', 'Mirror Work', 'Bridal Wear'],
        experience: { years: 14, description: 'Master of Hyderabadi embroidery and bridal couture.' },
        about: 'I specialize in Hyderabadi embroidery, zardozi work, and bridal wear. Each piece I create is a labor of love with intricate hand embroidery.',
        startingPrice: 800,
      },
      {
        name: 'Harish Prajapat', email: 'harish.prajapat@example.com', phone: '+91-9822222210',
        city: 'Jodhpur', businessName: 'Blue City Pottery',
        category: potter._id, skills: ['Blue Pottery', 'Traditional Motifs', 'Tiles', 'Decorative Items'],
        experience: { years: 16, description: 'Expert in Jodhpur\'s famous blue pottery tradition.' },
        about: 'Blue City Pottery creates authentic Jodhpur blue pottery using traditional techniques. Our products are loved worldwide for their vibrant color and intricate designs.',
        startingPrice: 250,
      },
    ];

    // Demo entrepreneur
    const demoEntrepreneurUser = await User.create({
      name: 'Demo Entrepreneur',
      email: config.entrepreneurEmail,
      password: config.entrepreneurPassword,
      phone: '+91-9800000003',
      role: 'entrepreneur',
      location: { city: 'Mumbai' },
    });

    const entrepreneurUsers = await Promise.all(
      entrepreneurData.map((e) =>
        User.create({
          name: e.name, email: e.email, phone: e.phone, password: 'Entrepreneur@12345',
          role: 'entrepreneur', location: { city: e.city },
        })
      )
    );

    // Create entrepreneur profiles
    const entrepreneurProfiles = await Promise.all(
      entrepreneurData.map((e, i) =>
        EntrepreneurProfile.create({
          user: entrepreneurUsers[i]._id,
          businessName: e.businessName,
          category: e.category,
          skills: e.skills,
          experience: e.experience,
          about: e.about,
          location: { city: e.city, address: `${Math.floor(Math.random() * 200) + 1}, Main Market, ${e.city}` },
          profileImage: { url: DEMO_IMAGES.profiles[i], public_id: `demo_${i}` },
          verificationStatus: i < 8 ? 'approved' : 'pending',
          verifiedAt: i < 8 ? new Date() : undefined,
          startingPrice: e.startingPrice,
          availability: {
            isAvailable: i !== 5,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            workingHours: { start: '09:00', end: '18:00' },
          },
          averageRating: [4.8, 4.6, 4.9, 4.7, 4.5, 4.8, 4.3, 4.6, 4.9, 4.4][i] || 4.5,
          totalReviews: [24, 18, 31, 15, 12, 20, 9, 16, 28, 11][i] || 10,
        })
      )
    );

    // Demo entrepreneur profile
    const demoEntrepreneurProfile = await EntrepreneurProfile.create({
      user: demoEntrepreneurUser._id,
      businessName: 'Demo Craft Studio',
      category: artisan._id,
      skills: ['Handmade Crafts', 'Painting', 'Decorative Items'],
      experience: { years: 5, description: 'Artisan creating beautiful handmade crafts.' },
      about: 'This is the demo entrepreneur account for testing HunarHub platform features.',
      location: { city: 'Mumbai', address: '101, Craft Lane, Andheri West, Mumbai' },
      profileImage: { url: 'https://i.pravatar.cc/300?img=11', public_id: 'demo_entrepreneur' },
      verificationStatus: 'approved',
      verifiedAt: new Date(),
      startingPrice: 200,
      availability: { isAvailable: true, workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], workingHours: { start: '09:00', end: '18:00' } },
      averageRating: 4.5,
      totalReviews: 5,
    });

    const allProfiles = [...entrepreneurProfiles, demoEntrepreneurProfile];
    console.log('✅ Entrepreneur profiles created:', allProfiles.length);

    // ===================== SERVICES =====================
    console.log('🔧 Creating services...');
    const servicesData = [
      { entrepreneur: allProfiles[0]._id, title: 'Complete Shoe Repair', description: 'Full repair service including sole replacement, stitching, and polishing. Your shoes will look brand new!', category: cobbler._id, price: 150, priceType: 'fixed', estimatedTime: { value: 2, unit: 'days' } },
      { entrepreneur: allProfiles[0]._id, title: 'Leather Sole Replacement', description: 'Professional leather sole replacement for formal shoes. High quality leather used.', category: cobbler._id, price: 300, priceType: 'fixed', estimatedTime: { value: 3, unit: 'days' } },
      { entrepreneur: allProfiles[1]._id, title: 'Custom Pottery Set', description: 'Hand-crafted custom pottery set including bowls, cups and a decorative pot. Made to order.', category: potter._id, price: 800, priceType: 'starting_from', estimatedTime: { value: 7, unit: 'days' } },
      { entrepreneur: allProfiles[1]._id, title: 'Wedding Decoration Pottery', description: 'Beautiful terracotta decorative pieces for weddings and special events.', category: potter._id, price: 2500, priceType: 'starting_from', estimatedTime: { value: 14, unit: 'days' } },
      { entrepreneur: allProfiles[2]._id, title: 'Salwar Kameez Stitching', description: 'Expert stitching of salwar kameez with perfect measurements and finishing. Chikankari embroidery available.', category: tailor._id, price: 600, priceType: 'starting_from', estimatedTime: { value: 5, unit: 'days' } },
      { entrepreneur: allProfiles[2]._id, title: 'Bridal Lehenga Stitching', description: 'Premium bridal lehenga stitching with intricate embroidery. Makes your special day unforgettable.', category: tailor._id, price: 3000, priceType: 'starting_from', estimatedTime: { value: 21, unit: 'days' } },
      { entrepreneur: allProfiles[3]._id, title: 'Custom Banarasi Saree Weaving', description: 'Pure Banarasi silk saree woven to your specifications with traditional zari work.', category: artisan._id, price: 8000, priceType: 'starting_from', estimatedTime: { value: 30, unit: 'days' } },
      { entrepreneur: allProfiles[4]._id, title: 'Block Print Fabric (Per Meter)', description: 'Hand block printed fabric using natural dyes. Custom designs available.', category: artisan._id, price: 150, priceType: 'fixed', estimatedTime: { value: 3, unit: 'days' } },
      { entrepreneur: allProfiles[5]._id, title: 'Suit & Sherwani Stitching', description: 'Premium suit and sherwani stitching for weddings and formal occasions.', category: tailor._id, price: 2000, priceType: 'starting_from', estimatedTime: { value: 10, unit: 'days' } },
      { entrepreneur: allProfiles[6]._id, title: 'Madhubani Painting Commission', description: 'Custom Madhubani painting on canvas or paper. Various sizes available.', category: artisan._id, price: 500, priceType: 'starting_from', estimatedTime: { value: 7, unit: 'days' } },
      { entrepreneur: allProfiles[7]._id, title: 'Sports Shoe Repair', description: 'Expert repair of sports and athletic footwear. All brands serviced.', category: cobbler._id, price: 120, priceType: 'fixed', estimatedTime: { value: 1, unit: 'days' } },
      { entrepreneur: allProfiles[8]._id, title: 'Zardozi Bridal Work', description: 'Intricate zardozi embroidery for bridal wear. Each stitch done by hand with care.', category: tailor._id, price: 5000, priceType: 'starting_from', estimatedTime: { value: 25, unit: 'days' } },
      { entrepreneur: allProfiles[9]._id, title: 'Blue Pottery Set Custom Order', description: 'Custom blue pottery set with your preferred design and size. Perfect for home decor.', category: potter._id, price: 1500, priceType: 'starting_from', estimatedTime: { value: 10, unit: 'days' } },
      { entrepreneur: allProfiles[10]._id, title: 'Handmade Craft Workshop', description: 'Learn to make handmade crafts in our studio. Fun for individuals and groups.', category: artisan._id, price: 500, priceType: 'hourly', estimatedTime: { value: 3, unit: 'hours' } },
      { entrepreneur: allProfiles[10]._id, title: 'Custom Decorative Item', description: 'Bespoke decorative items made to your specifications. Perfect gifts.', category: artisan._id, price: 300, priceType: 'starting_from', estimatedTime: { value: 5, unit: 'days' } },
    ];

    const services = await Service.create(
      servicesData.map((s, i) => ({
        ...s,
        images: [{ url: DEMO_IMAGES.products[i % DEMO_IMAGES.products.length], public_id: `service_${i}` }],
        status: 'active',
        isAvailable: i !== 12,
        totalRequests: Math.floor(Math.random() * 30),
      }))
    );
    console.log('✅ Services created:', services.length);

    // ===================== PRODUCTS =====================
    console.log('📦 Creating products...');
    const productsData = [
      { entrepreneur: allProfiles[0]._id, name: 'Handmade Leather Wallet', description: 'Genuine leather wallet hand-stitched by expert cobbler. Durable and stylish.', category: cobbler._id, price: 450, stock: 15, condition: 'handmade', location: 'Agra' },
      { entrepreneur: allProfiles[0]._id, name: 'Leather Shoe Care Kit', description: 'Complete shoe care kit with polish, brush and cloth. Keep your shoes shining.', category: cobbler._id, price: 250, stock: 30, condition: 'new', location: 'Agra' },
      { entrepreneur: allProfiles[1]._id, name: 'Decorative Clay Pot Set (3pc)', description: 'Beautiful set of 3 terracotta pots with traditional Rajasthani painted designs.', category: potter._id, price: 650, stock: 20, condition: 'handmade', location: 'Jaipur' },
      { entrepreneur: allProfiles[1]._id, name: 'Terracotta Wall Hanging', description: 'Traditional Rajasthani terracotta wall hanging with intricate designs. Perfect home decor.', category: potter._id, price: 850, stock: 12, condition: 'handmade', location: 'Jaipur' },
      { entrepreneur: allProfiles[1]._id, name: 'Clay Diyas (Set of 20)', description: 'Handmade traditional clay diyas perfect for Diwali and festivals. Set of 20.', category: potter._id, price: 180, stock: 100, condition: 'handmade', location: 'Jaipur' },
      { entrepreneur: allProfiles[2]._id, name: 'Chikankari Dupatta', description: 'Authentic Lucknawi chikankari dupatta on georgette fabric. Delicate hand embroidery.', category: tailor._id, price: 1200, stock: 8, condition: 'handmade', location: 'Lucknow' },
      { entrepreneur: allProfiles[3]._id, name: 'Banarasi Silk Stole', description: 'Pure Banarasi silk stole with gold zari border. Luxurious handwoven piece.', category: artisan._id, price: 2500, stock: 5, condition: 'handmade', location: 'Varanasi' },
      { entrepreneur: allProfiles[4]._id, name: 'Block Print Tote Bag', description: 'Eco-friendly cotton tote bag with beautiful Rajasthani block print design.', category: artisan._id, price: 350, stock: 25, condition: 'handmade', location: 'Jaipur' },
      { entrepreneur: allProfiles[4]._id, name: 'Block Print Table Runner', description: 'Hand block printed table runner with floral motifs. Natural fabric and dyes.', category: artisan._id, price: 550, stock: 18, condition: 'handmade', location: 'Jaipur' },
      { entrepreneur: allProfiles[5]._id, name: 'Ready-made Kurta (M)', description: 'Hand-stitched traditional kurta in premium cotton fabric. Available in size M.', category: tailor._id, price: 800, stock: 10, condition: 'handmade', location: 'Delhi' },
      { entrepreneur: allProfiles[6]._id, name: 'Madhubani Art Print (A3)', description: 'Original Madhubani painting on handmade paper. Traditional folk art from Bihar.', category: artisan._id, price: 750, stock: 6, condition: 'handmade', location: 'Bhopal' },
      { entrepreneur: allProfiles[6]._id, name: 'Gond Art Canvas (12x16)', description: 'Vibrant Gond tribal art on canvas. Each piece is one-of-a-kind.', category: artisan._id, price: 1200, stock: 4, condition: 'handmade', location: 'Bhopal' },
      { entrepreneur: allProfiles[9]._id, name: 'Blue Pottery Serving Bowl', description: 'Authentic Jodhpur blue pottery serving bowl with traditional floral design.', category: potter._id, price: 480, stock: 22, condition: 'handmade', location: 'Jodhpur' },
      { entrepreneur: allProfiles[9]._id, name: 'Blue Pottery Vase Set (2pc)', description: 'Pair of handcrafted blue pottery vases. Perfect for flowers and home decor.', category: potter._id, price: 950, stock: 14, condition: 'handmade', location: 'Jodhpur' },
      { entrepreneur: allProfiles[9]._id, name: 'Blue Pottery Tea Cup Set', description: 'Set of 6 blue pottery tea cups with saucers. Traditional Jodhpur design.', category: potter._id, price: 1350, stock: 8, condition: 'handmade', location: 'Jodhpur' },
      { entrepreneur: allProfiles[7]._id, name: 'Leather Belt (Handmade)', description: 'Genuine leather belt with hand-stitched edges. Custom length available.', category: cobbler._id, price: 380, stock: 20, condition: 'handmade', location: 'Pune' },
      { entrepreneur: allProfiles[8]._id, name: 'Embroidered Dupatta', description: 'Hand-embroidered dupatta with zardozi work. Hyderabadi craftsmanship at its finest.', category: tailor._id, price: 1800, stock: 7, condition: 'handmade', location: 'Hyderabad' },
      { entrepreneur: allProfiles[10]._id, name: 'Handmade Macrame Wall Art', description: 'Boho macrame wall hanging made with natural cotton rope. Modern and trendy.', category: artisan._id, price: 650, stock: 12, condition: 'handmade', location: 'Mumbai' },
      { entrepreneur: allProfiles[10]._id, name: 'Handmade Greeting Cards (Pack of 5)', description: 'Set of 5 handmade greeting cards for various occasions. Perfect for gifting.', category: artisan._id, price: 200, stock: 40, condition: 'handmade', location: 'Mumbai' },
      { entrepreneur: allProfiles[2]._id, name: 'Ready Salwar Suit (L)', description: 'Ready-made embroidered salwar suit in size L. Cotton fabric with chikankari work.', category: tailor._id, price: 1500, stock: 6, condition: 'handmade', location: 'Lucknow' },
    ];

    const products = await Product.create(
      productsData.map((p, i) => ({
        ...p,
        images: [{ url: DEMO_IMAGES.products[i % DEMO_IMAGES.products.length], public_id: `product_${i}` }],
        status: 'active',
        isAvailable: true,
        totalSold: Math.floor(Math.random() * 50),
        tags: ['handmade', 'local', 'artisan'],
      }))
    );
    console.log('✅ Products created:', products.length);

    // ===================== ORDERS =====================
    console.log('📋 Creating orders...');
    const orderStatuses = ['completed', 'completed', 'completed', 'processing', 'pending', 'confirmed', 'cancelled'];
    const orders = [];

    for (let i = 0; i < 12; i++) {
      const customer = allCustomers[i % allCustomers.length];
      const product = products[i % products.length];
      const status = orderStatuses[i % orderStatuses.length];
      const qty = Math.floor(Math.random() * 3) + 1;
      const amount = product.price * qty;

      const order = await Order.create({
        customer: customer._id,
        items: [{
          product: product._id,
          entrepreneur: product.entrepreneur,
          name: product.name,
          quantity: qty,
          price: product.price,
          image: product.images[0]?.url || '',
        }],
        totalAmount: amount,
        shippingAddress: {
          name: customer.name,
          phone: '+91-9811111101',
          address: `${Math.floor(Math.random() * 500) + 1}, Local Street`,
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
        },
        orderStatus: status,
        paymentMethod: 'cash',
        paymentStatus: status === 'completed' ? 'paid' : 'pending',
        completedAt: status === 'completed' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        statusHistory: [{ status: 'pending', changedBy: customer._id }],
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      });
      orders.push(order);

      // Update earnings for completed orders
      if (status === 'completed') {
        await EntrepreneurProfile.findByIdAndUpdate(product.entrepreneur, { $inc: { totalEarnings: amount } });
      }
    }
    console.log('✅ Orders created:', orders.length);

    // ===================== SERVICE REQUESTS =====================
    console.log('📝 Creating service requests...');
    const requestStatuses = ['completed', 'completed', 'accepted', 'pending', 'rejected', 'in_progress', 'cancelled'];
    const serviceRequests = [];

    for (let i = 0; i < 12; i++) {
      const customer = allCustomers[i % allCustomers.length];
      const service = services[i % services.length];
      const entrepreneur = allProfiles.find((p) => p._id.equals(service.entrepreneur));
      const status = requestStatuses[i % requestStatuses.length];

      if (!entrepreneur) continue;

      const sr = await ServiceRequest.create({
        customer: customer._id,
        entrepreneur: entrepreneur._id,
        service: service._id,
        description: `I need your service for a special occasion. Please confirm availability and pricing.`,
        preferredDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        preferredTime: '10:00 AM',
        location: `${Math.floor(Math.random() * 200) + 1}, Local Street, ${entrepreneur.location.city}`,
        budget: service.price * 1.1,
        status,
        agreedPrice: status === 'completed' ? service.price : 0,
        completedAt: status === 'completed' ? new Date() : undefined,
        statusHistory: [{ status: 'pending', changedBy: customer._id }],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
      serviceRequests.push(sr);

      // Update entrepreneur earnings for completed service requests
      if (status === 'completed' && service.price > 0) {
        await EntrepreneurProfile.findByIdAndUpdate(entrepreneur._id, { $inc: { totalEarnings: service.price } });
      }
    }
    console.log('✅ Service requests created:', serviceRequests.length);

    // ===================== REVIEWS =====================
    console.log('⭐ Creating reviews...');
    const reviewComments = [
      'Excellent work! Highly recommended. The quality exceeded my expectations.',
      'Very professional and delivered on time. Will definitely come back.',
      'Good service but could be a bit faster. Overall satisfied.',
      'Amazing craftsmanship! Every detail was perfect.',
      'Great value for money. The product quality is outstanding.',
      'Wonderful experience. The entrepreneur was very cooperative.',
      'Beautiful work! Exactly what I wanted.',
      'Professional service with excellent finishing.',
    ];

    const completedOrders = orders.filter((o) => o.orderStatus === 'completed');
    const completedRequests = serviceRequests.filter((r) => r.status === 'completed');

    let reviewCount = 0;
    for (const order of completedOrders.slice(0, 5)) {
      const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
      const product = products.find((p) => order.items[0]?.product.equals(p._id));
      if (!product) continue;

      await Review.create({
        customer: order.customer,
        entrepreneur: product.entrepreneur,
        order: order._id,
        rating,
        comment: reviewComments[reviewCount % reviewComments.length],
        isVerifiedPurchase: true,
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      });
      reviewCount++;
    }

    for (const req of completedRequests.slice(0, 5)) {
      const rating = Math.floor(Math.random() * 2) + 4;
      await Review.create({
        customer: req.customer,
        entrepreneur: req.entrepreneur,
        serviceRequest: req._id,
        rating,
        comment: reviewComments[reviewCount % reviewComments.length],
        isVerifiedPurchase: true,
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      });
      reviewCount++;
    }
    console.log('✅ Reviews created:', reviewCount);

    // ===================== NOTIFICATIONS =====================
    console.log('🔔 Creating notifications...');
    const notifData = [
      { recipient: demoCustomerUser._id, type: 'order_confirmed', title: 'Order Confirmed!', message: 'Your order has been confirmed and is being processed.', isRead: false },
      { recipient: demoCustomerUser._id, type: 'service_request_accepted', title: 'Service Request Accepted!', message: 'Your service request has been accepted by the entrepreneur.', isRead: false },
      { recipient: demoEntrepreneurUser._id, type: 'order_placed', title: 'New Order Received!', message: 'You have received a new order from a customer.', isRead: false },
      { recipient: demoEntrepreneurUser._id, type: 'service_request_received', title: 'New Service Request!', message: 'A customer has sent you a service request.', isRead: true },
      { recipient: admin._id, type: 'entrepreneur_registered', title: 'New Entrepreneur Registration', message: 'A new entrepreneur has registered and is awaiting approval.', isRead: false },
      { recipient: admin._id, type: 'new_complaint', title: 'New Complaint Filed', message: 'A customer has filed a complaint that needs your attention.', isRead: false },
      { recipient: demoEntrepreneurUser._id, type: 'entrepreneur_approved', title: 'Profile Approved! 🎉', message: 'Your entrepreneur profile has been approved. You can now receive orders!', isRead: true },
    ];

    await Notification.create(notifData);
    console.log('✅ Notifications created');

    // ===================== COMPLAINTS =====================
    console.log('📣 Creating complaints...');
    await Complaint.create([
      {
        user: allCustomers[0]._id,
        relatedOrder: orders[0]?._id,
        subject: 'Product quality not as described',
        description: 'The product I received was not matching the description on the platform. The quality was much lower than expected.',
        status: 'in_review',
        priority: 'high',
      },
      {
        user: allCustomers[1]._id,
        relatedServiceRequest: serviceRequests[0]?._id,
        subject: 'Service not completed on time',
        description: 'The entrepreneur promised to complete the service in 3 days but it has been 7 days and still not done.',
        status: 'open',
        priority: 'medium',
      },
      {
        user: allCustomers[2]._id,
        subject: 'Payment issue',
        description: 'I made a payment but the order status was not updated. Please look into this.',
        status: 'resolved',
        adminResponse: 'We have investigated this issue and found that it was a technical glitch. Your order status has been updated. We apologize for the inconvenience.',
        respondedAt: new Date(),
        respondedBy: admin._id,
        priority: 'high',
      },
      {
        user: demoCustomerUser._id,
        subject: 'Demo complaint for testing',
        description: 'This is a demo complaint created for testing the platform complaint management system.',
        status: 'open',
        priority: 'low',
      },
    ]);
    console.log('✅ Complaints created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('='.repeat(50));
    console.log('DEMO ACCOUNTS:');
    console.log('='.repeat(50));
    console.log(`👑 Admin:        ${config.adminEmail} / ${config.adminPassword}`);
    console.log(`👤 Customer:     ${config.customerEmail} / ${config.customerPassword}`);
    console.log(`🧑‍💼 Entrepreneur: ${config.entrepreneurEmail} / ${config.entrepreneurPassword}`);
    console.log('='.repeat(50));
    console.log(`\nCreated:`);
    console.log(`  - ${categories.length} categories`);
    console.log(`  - ${allCustomers.length} customers`);
    console.log(`  - ${allProfiles.length} entrepreneur profiles`);
    console.log(`  - ${services.length} services`);
    console.log(`  - ${products.length} products`);
    console.log(`  - ${orders.length} orders`);
    console.log(`  - ${serviceRequests.length} service requests`);
    console.log(`  - ${reviewCount} reviews`);
    console.log('\n✅ Data seeding complete!\n');
    return true;
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
};

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedData: seed };
