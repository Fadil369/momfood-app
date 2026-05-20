import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, ShoppingCart, MapPin, Clock, Award, Shield, Star, Heart, Facebook, Twitter, Instagram } from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                MomFood
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Home</a>
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Menu</a>
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">About</a>
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Contact</a>
              </nav>
              
              <div className="flex items-center space-x-2">
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  <ShoppingCart className="h-4 w-4 inline mr-1" />
                  3
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full inline-flex items-center mb-4">
              <Star className="h-4 w-4 mr-1" />
              Family Recipe Since 1995
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
              Authentic Home Cooking
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the warmth of homemade meals prepared with love and traditional recipes passed down through generations. Fresh ingredients, authentic flavors, delivered to your door.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Now
              </Button>
              <Button size="lg" variant="outline" className="border-2 px-8 py-6 text-lg">
                <MapPin className="h-5 w-5 mr-2" />
                Find Nearby
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Award className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                  <CardTitle>Quality Guaranteed</CardTitle>
                  <CardDescription>Fresh ingredients and authentic preparation</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Clock className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <CardTitle>Fast Delivery</CardTitle>
                  <CardDescription>Hot meals delivered in 30 minutes or less</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Shield className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                  <CardTitle>Safe & Hygienic</CardTitle>
                  <CardDescription>Strict quality and safety standards</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose MomFood?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine traditional cooking methods with modern convenience to bring you the best home-cooked experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Authentic Flavors, Modern Convenience</h3>
              <p className="text-gray-600 mb-6">
                Our kitchen staff follows time-tested recipes that have been perfected over generations. Every dish is prepared with care and attention to detail, ensuring you get the authentic taste of home-cooked food.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Traditional cooking methods</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Fresh, locally sourced ingredients</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>No artificial preservatives</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Customizable spice levels</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Special Offers</CardTitle>
                  <CardDescription>Exclusive deals for our valued customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span>20% off first order</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">NEW</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Free delivery on orders over $30</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">FREE</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span>Buy 2 get 1 free on weekends</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">WEEKEND</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 text-green-500 flex items-center justify-center">🚚</div>
                      <span>Standard Delivery (30-45 mins)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 text-blue-500 flex items-center justify-center">⏰</div>
                      <span>Scheduled Delivery</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 text-purple-500 flex items-center justify-center">📦</div>
                      <span>Pickup Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="py-20 bg-gradient-to-br from-orange-100 to-red-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular Dishes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most beloved dishes that have captured hearts and taste buds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="group hover:shadow-xl transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-orange-200 to-red-200 rounded-t-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ChefHat className="h-16 w-16 text-orange-600 opacity-50" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Grandma's Special Dish {item}</span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">$12.{item}9</span>
                  </CardTitle>
                  <CardDescription>
                    Traditional recipe with fresh ingredients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>25-30 mins</span>
                    <Heart className="h-4 w-4 ml-auto text-red-500" />
                    <span>{Math.floor(Math.random() * 50) + 20} likes</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers who have experienced the taste of home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((testimonial) => (
              <Card key={testimonial}>
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">C{testimonial}</span>
                    </div>
                    <div>
                      <CardTitle>Customer {testimonial}</CardTitle>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.min(testimonial + 1, 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">
                    "The taste brings back memories of my grandmother's kitchen. Absolutely delicious and made with such care. This is exactly what I've been looking for!"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Newsletter */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="mb-8 opacity-90">
                Have questions about our menu or services? Want to learn more about our catering options? Reach out to us!
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5" />
                  <span>123 Kitchen Street, Foodville, FK 12345</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 flex items-center justify-center">📞</div>
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 flex items-center justify-center">✉️</div>
                  <span>hello@momfood.com</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="secondary" size="icon" className="bg-white/20 hover:bg-white/30">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-white/20 hover:bg-white/30">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-white/20 hover:bg-white/30">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Join Our Newsletter</CardTitle>
                  <CardDescription className="text-white/80">
                    Stay updated with our latest offers, new menu items, and cooking tips.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-white block">Email</label>
                      <input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/60"
                      />
                    </div>
                    <Button className="w-full bg-white text-orange-500 hover:bg-orange-50">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="h-8 w-8 text-orange-500" />
                <span className="text-2xl font-bold">MomFood</span>
              </div>
              <p className="text-gray-400">
                Bringing the taste of home to your table since 1995.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Menu</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">About Us</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Locations</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Careers</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Delivery</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Pickup</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Catering</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Gift Cards</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>123 Kitchen Street</p>
                <p>Foodville, FK 12345</p>
                <p>(555) 123-4567</p>
                <p>hello@momfood.com</p>
              </div>
            </div>
          </div>
          
          <hr className="my-8 border-gray-700" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 MomFood. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { LandingPage }
