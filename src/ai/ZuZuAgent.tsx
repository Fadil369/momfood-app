import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  MapPin, 
  Clock, 
  ChefHat, 
  ShoppingBag,
  Shield,
  GraduationCap,
  Heart,
  Building,
  Car,
  Stethoscope
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'zuzu';
  timestamp: Date;
  type?: 'text' | 'voice' | 'status' | 'action';
}

interface UserProfile {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  country: 'SD' | 'SA';
  idType: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  roles: string[];
  socialCategory?: string;
  avatarUrl?: string;
}

const ZuZuAgent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً! أنا ZuZu، مساعدك الذكي في عالم الطهي المنزلي. كيف يمكنني مساعدتك اليوم؟',
      sender: 'zuzu',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize user profile from localStorage or API
    const mockProfile: UserProfile = {
      id: 'user-123',
      phone: '+249912345678',
      email: 'user@example.com',
      fullName: 'Ahmed Mohamed',
      country: 'SD',
      idType: 'sudan_national_card',
      verificationStatus: 'verified',
      roles: ['customer', 'cook'],
      socialCategory: 'student'
    };
    setCurrentProfile(mockProfile);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'أفهم طلبك. سأقوم بمعالجته الآن.',
        'تم العثور على المطابخ القريبة منك.',
        'تم تأكيد طلبك وبدأ تحضيره.',
        'الطلب جاهز للتسليم، سيتم إرسال سائق قريب.'
      ];
      const zuzuMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'zuzu',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, zuzuMessage]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real implementation, this would use speech recognition
    if (!isListening) {
      // Start voice recording
      console.log('Starting voice recording...');
    } else {
      // Stop voice recording and send message
      const mockVoiceMessage: Message = {
        id: Date.now().toString(),
        text: 'أريد طلب وجبة من مطبخ فاطمة',
        sender: 'user',
        timestamp: new Date(),
        type: 'voice'
      };
      setMessages(prev => [...prev, mockVoiceMessage]);
      setIsListening(false);
    }
  };

  const handleRoleSwitch = (role: string) => {
    if (currentProfile && !currentProfile.roles.includes(role)) {
      const updatedProfile = {
        ...currentProfile,
        roles: [...currentProfile.roles, role]
      };
      setCurrentProfile(updatedProfile);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ZuZu AI Assistant
              </h1>
              <p className="text-gray-600">المساعد الذكي لمنصة MomFood</p>
            </div>
          </div>
          
          {currentProfile && (
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-bold text-sm">
                {currentProfile?.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-right">
                <p className="font-semibold">{currentProfile.fullName}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentProfile.roles.map(role => (
                    <span key={role} className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2">
                      {role}
                    </span>
                  ))}
                  <span 
                    className={`inline-block text-xs px-2 py-1 rounded ${
                      currentProfile.verificationStatus === 'verified' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : currentProfile.verificationStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {currentProfile.verificationStatus === 'verified' ? (
                      <Shield className="h-3 w-3 mr-1 inline" />
                    ) : currentProfile.verificationStatus === 'pending' ? (
                      <Clock className="h-3 w-3 mr-1 inline" />
                    ) : (
                      <Shield className="h-3 w-3 mr-1 inline" />
                    )}
                    {currentProfile.verificationStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>الأدوار المتاحة</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['customer', 'cook', 'driver'].map(role => (
                  <Button
                    key={role}
                    variant={currentProfile?.roles.includes(role) ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleRoleSwitch(role)}
                  >
                    {role === 'customer' && <ShoppingBag className="h-4 w-4 mr-2" />}
                    {role === 'cook' && <ChefHat className="h-4 w-4 mr-2" />}
                    {role === 'driver' && <Car className="h-4 w-4 mr-2" />}
                    {role}
                  </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>المساهمة الاجتماعية</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { icon: GraduationCap, label: 'طالب', category: 'student' },
                    { icon: Heart, label: 'مُسن', category: 'elder' },
                    { icon: Building, label: 'لاجئ', category: 'refugee' },
                    { icon: Stethoscope, label: 'طبيب/ممرض', category: 'healthcare' },
                  ].map(({ icon: Icon, label, category }) => (
                    <Button
                      key={category}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>الموقع</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {currentProfile?.country === 'SD' ? 'السودان' : 'المملكة العربية السعودية'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentProfile?.idType === 'sudan_national_card' ? 'بطاقة وطنية' : 
                   currentProfile?.idType === 'passport' ? 'جواز سفر' : 'إقامة'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <span>محادثة صوتية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.sender === 'zuzu' ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="اكتب رسالتك أو استخدم الميكروفون..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    onClick={handleVoiceInput}
                    className="h-10 w-10 p-0"
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                  <Button onClick={handleSendMessage} className="h-10 w-10 p-0">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZuZuAgent;