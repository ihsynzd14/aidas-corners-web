'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, AIProvider } from '@/types/ai-assistant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollAreaRoot } from '@/components/ui/scroll-area';
import { PastryColors } from '@/constants/Colors';
import { 
  SparklesIcon, 
  PaperAirplaneIcon, 
  ClipboardIcon, 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  ServerIcon,
  CakeIcon,
  HeartIcon,
  KeyIcon,
  CubeIcon,
  StarIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TypeWriterProps {
  text: string;
  onComplete?: () => void;
  className?: string;
}

const TypeWriter: React.FC<TypeWriterProps> = ({ text, onComplete, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const textRef = useRef(text);
  const chunkSize = 5; // Her adımda eklenecek karakter sayısı
  
  useEffect(() => {
    // Yeni metin geldiğinde referansı güncelle
    textRef.current = text;
    
    // Animasyonu sıfırla
    setDisplayedText('');
    setIsComplete(false);
    
    // Önceki timeout'u temizle
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Metin boşsa hemen tamamlandı say
    if (!text) {
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    // Animasyonu başlat
    const animateText = (currentLength = 0) => {
      if (currentLength >= text.length) {
        setIsComplete(true);
        onComplete?.();
        return;
      }
      
      // Bir sonraki chunk'ı hesapla
      const nextLength = Math.min(currentLength + chunkSize, text.length);
      
      // Metni güncelle
      setDisplayedText(text.substring(0, nextLength));
      
      // Bir sonraki adımı planla
      timeoutRef.current = setTimeout(() => {
        animateText(nextLength);
      }, 10);
    };
    
    // Animasyonu başlat
    animateText();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, onComplete]);
  
  // Metin tamamlandıysa veya komponent unmount olacaksa tam metni göster
  if (isComplete) {
    return <p className={className}>{textRef.current}</p>;
  }
  
  return <p className={className}>{displayedText}</p>;
};

interface AIProviderSelectorProps {
  currentProvider: AIProvider;
  onSelect: (provider: AIProvider) => void;
}

const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({ 
  currentProvider, 
  onSelect 
}) => {
  const providers: { id: AIProvider; name: string; icon: React.ReactNode }[] = [
    { 
      id: 'groq', 
      name: 'Groq AI', 
      icon: <CpuChipIcon className="h-4 w-4" /> 
    },
    { 
      id: 'gemini', 
      name: 'Gemini Flash 2 Pro', 
      icon: <RocketLaunchIcon className="h-4 w-4" /> 
    },
    { 
      id: 'openrouter', 
      name: 'DeepSeek R1', 
      icon: <ServerIcon className="h-4 w-4" /> 
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 text-xs hover:bg-primary/5 transition-colors"
        >
          {providers.find(p => p.id === currentProvider)?.icon}
          {providers.find(p => p.id === currentProvider)?.name}
          <ChevronDownIcon className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {providers.map(provider => (
          <DropdownMenuItem
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            className={cn(
              "gap-2 cursor-pointer transition-colors",
              currentProvider === provider.id && "bg-primary/10"
            )}
          >
            {provider.icon}
            {provider.name}
            {currentProvider === provider.id && (
              <CheckIcon className="h-4 w-4 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface HelpDialogProps {
  onSelectQuestion: (question: string) => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ onSelectQuestion }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const examples = [
    {
      title: 'Sadə Suallar',
      description: 'Tək bir məlumat tələb edən sadə sorğular',
      goodExample: {
        question: '01.02.2024 - 28.02.2024 tarixləri arasında Next Crescent filialında Tiramisu satışı nə qədərdir?',
        explanation: '✓ Tarix aralığı, filial adı və məhsul adı dəqiq göstərilib\n✓ Tək bir məlumat soruşulur\n✓ "nə qədərdir" ifadəsi ilə rəqəmsal məlumat tələb edilir'
      },
      badExample: {
        question: 'Tiramisu satışı necədir?',
        explanation: '✗ Tarix aralığı yoxdur\n✗ Hansı filial olduğu bilinmir\n✗ "necədir" sözü qeyri-müəyyəndir'
      },
      questions: [
        'Neçə filial (branch) var?',
        'Next Mərkəz filialında hansı desert növləri satılır?',
        'Next Crescent filialında Tiramisu satışı nə qədərdir?'
      ]
    },
    {
      title: 'Orta Səviyyəli Suallar',
      description: 'Bir neçə məlumatın müqayisəsini tələb edən sorğular',
      goodExample: {
        question: '01.02.2024 - 28.02.2024 tarixləri arasında San Sebastian tortunun bütün filiallardakı ümumi satış miqdarı nə qədərdir?',
        explanation: '✓ Tarix aralığı dəqiq göstərilib\n✓ Məhsul adı tam yazılıb\n✓ "ümumi satış miqdarı" ilə nəyin hesablanacağı aydındır'
      },
      badExample: {
        question: 'Tortların satışını müqayisə edin',
        explanation: '✗ Hansı tortlar olduğu bilinmir\n✗ Tarix aralığı yoxdur\n✗ Müqayisə meyarları qeyri-müəyyəndir'
      },
      questions: [
        'Hansı filialda ən çox məhsul çeşidi var və neçə çeşiddir?',
        'San Sebastian bütün filiallardakı ümumi satış miqdarı nə qədərdir?',
        'Profiterol satışı edən filialları və miqdarlarını sadalayın.'
      ]
    },
    {
      title: 'Çətin Suallar',
      description: 'Kompleks təhlil və müqayisə tələb edən sorğular',
      goodExample: {
        question: '01.02.2024 - 28.02.2024 tarixləri arasında Next və Coffemania filiallarının məhsul çeşidlərini və satış həcmlərini müqayisə edin.',
        explanation: '✓ Tarix aralığı dəqiq göstərilib\n✓ Müqayisə ediləcək qruplar aydındır\n✓ Müqayisə meyarları (çeşid və həcm) dəqiq göstərilib'
      },
      badExample: {
        question: 'Ən yaxşı filialı tapın',
        explanation: '✗ "Ən yaxşı" meyarı qeyri-müəyyəndir\n✗ Tarix aralığı yoxdur\n✗ Hansı göstəricilərə görə müqayisə ediləcəyi bilinmir'
      },
      questions: [
        'Ən yüksək satış miqdarına malik olan 3 məhsulu və miqdarlarını tapın.',
        'Next brendinə aid filialların və Coffemania brendinə aid filialların məhsul çeşidlərini müqayisə edin.',
        'Hər filialın ən çox və ən az satılan məhsulunu və miqdarlarını tapın.',
        'Bütün filiallarda ortaq olan məhsulları müəyyən edin və satış miqdarlarını müqayisə edin.'
      ]
    }
  ];

  const aiProviders = [
    {
      id: 'groq',
      title: 'Groq AI',
      icon: <CpuChipIcon className="h-5 w-5" />,
      description: 'Ən sürətli və dəqiq cavablar üçün',
      features: [
        'Çox sürətli cavab müddəti',
        'Mürəkkəb analitik sorğular üçün optimal',
        'Dəqiq rəqəmsal hesablamalar',
        'Yüksək kontekst anlama qabiliyyəti'
      ],
      bestFor: 'Satış təhlili və statistik hesabatlar üçün ən yaxşı seçim'
    },
    {
      id: 'gemini',
      title: 'Gemini Flash 2 Pro',
      icon: <RocketLaunchIcon className="h-5 w-5" />,
      description: 'Yaradıcı və geniş təhlil tələb edən sorğular üçün',
      features: [
        'Geniş kontekst pəncərəsi',
        'Yaradıcı təhlil qabiliyyəti',
        'Çoxlu məlumatın müqayisəsi',
        'Trend analizi və proqnozlaşdırma'
      ],
      bestFor: 'Müqayisəli təhlillər və trend analizi üçün optimal'
    },
    {
      id: 'deepseek',
      title: 'DeepSeek R1',
      icon: <ServerIcon className="h-5 w-5" />,
      description: 'Balanslaşdırılmış performans və dəqiqlik',
      features: [
        'Yüksək dəqiqlik',
        'Orta sürət',
        'Yaxşı kontekst anlama',
        'Effektiv resurs istifadəsi'
      ],
      bestFor: 'Ümumi sorğular və gündəlik istifadə üçün'
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <QuestionMarkCircleIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Sual Nümunələri</DialogTitle>
          <DialogDescription>
            AI köməkçidən daha effektiv istifadə etmək üçün aşağıdakı nümunələrə baxın
          </DialogDescription>
        </DialogHeader>
        
        <ScrollAreaRoot className="flex-1 pr-4">
          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="questions">Sual Nümunələri</TabsTrigger>
              <TabsTrigger value="providers">AI Növləri</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questions" className="space-y-4">
              {examples.map((category, index) => (
                <Accordion 
                  key={index} 
                  type="single" 
                  collapsible
                >
                  <AccordionItem value={category.title}>
                    <AccordionTrigger className="text-lg font-medium">
                      {category.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-muted-foreground">{category.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-green-500 bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                          <h4 className="text-green-600 font-medium mb-2">Düzgün Sual:</h4>
                          <p className="mb-2">{category.goodExample.question}</p>
                          <p className="text-sm text-green-600 whitespace-pre-line">{category.goodExample.explanation}</p>
                        </div>
                        
                        <div className="border border-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                          <h4 className="text-red-600 font-medium mb-2">Səhv Sual:</h4>
                          <p className="mb-2">{category.badExample.question}</p>
                          <p className="text-sm text-red-600 whitespace-pre-line">{category.badExample.explanation}</p>
                        </div>
                      </div>
                      
                      <h4 className="text-primary font-medium mt-4">Nümunə Suallar:</h4>
                      <div className="space-y-2">
                        {category.questions.map((question, qIndex) => (
                          <div 
                            key={qIndex}
                            className="flex items-center justify-between bg-primary/5 p-3 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => onSelectQuestion(question)}
                          >
                            <p>{question}</p>
                            <ClipboardIcon className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </TabsContent>
            
            <TabsContent value="providers" className="space-y-4">
              <p className="text-muted-foreground">
                Hər bir AI növünün öz güclü tərəfləri var. Sualınızın tipinə görə ən uyğun olanı seçin:
              </p>
              
              {aiProviders.map((provider) => (
                <Accordion 
                  key={provider.id} 
                  type="single" 
                  collapsible
                >
                  <AccordionItem value={provider.id}>
                    <AccordionTrigger className="text-lg font-medium">
                      <div className="flex items-center gap-2">
                        {provider.icon}
                        <span>{provider.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-muted-foreground">{provider.description}</p>
                      
                      <div className="space-y-2">
                        {provider.features.map((feature, fIndex) => (
                          <div key={fIndex} className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4 text-primary" />
                            <p>{feature}</p>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-primary font-medium">{provider.bestFor}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </TabsContent>
          </Tabs>
        </ScrollAreaRoot>
      </DialogContent>
    </Dialog>
  );
};

interface APIKeyDialogProps {
  onUpdateKeys: (keys: { groq: string; gemini: string; openrouter: string }) => void;
}

const APIKeyDialog: React.FC<APIKeyDialogProps> = ({ onUpdateKeys }) => {
  const [keys, setKeys] = useState({
    groq: localStorage.getItem('groq_api_key') || '',
    gemini: localStorage.getItem('gemini_api_key') || '',
    openrouter: localStorage.getItem('openrouter_api_key') || ''
  });
  const [showPasswords, setShowPasswords] = useState({
    groq: false,
    gemini: false,
    openrouter: false
  });

  const handleSave = () => {
    localStorage.setItem('groq_api_key', keys.groq);
    localStorage.setItem('gemini_api_key', keys.gemini);
    localStorage.setItem('openrouter_api_key', keys.openrouter);
    onUpdateKeys(keys);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-amber-500 dark:text-gray-400">
          <KeyIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>API Açarları</DialogTitle>
          <DialogDescription>
            AI təchizatçıları üçün API açarlarını yeniləyin
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Groq AI API Açarı</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPasswords(prev => ({ ...prev, groq: !prev.groq }))}
                className="text-xs"
              >
                {showPasswords.groq ? 'Gizlət' : 'Göstər'}
              </Button>
            </div>
            <div className="relative">
              <Input
                value={keys.groq}
                onChange={(e) => setKeys(prev => ({ ...prev, groq: e.target.value }))}
                placeholder="gsk_..."
                type={showPasswords.groq ? "text" : "password"}
                className="pr-20 font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Gemini API Açarı</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPasswords(prev => ({ ...prev, gemini: !prev.gemini }))}
                className="text-xs"
              >
                {showPasswords.gemini ? 'Gizlət' : 'Göstər'}
              </Button>
            </div>
            <div className="relative">
              <Input
                value={keys.gemini}
                onChange={(e) => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
                placeholder="AIzaSy..."
                type={showPasswords.gemini ? "text" : "password"}
                className="pr-20 font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">OpenRouter API Açarı</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPasswords(prev => ({ ...prev, openrouter: !prev.openrouter }))}
                className="text-xs"
              >
                {showPasswords.openrouter ? 'Gizlət' : 'Göstər'}
              </Button>
            </div>
            <div className="relative">
              <Input
                value={keys.openrouter}
                onChange={(e) => setKeys(prev => ({ ...prev, openrouter: e.target.value }))}
                placeholder="sk-or-v1-..."
                type={showPasswords.openrouter ? "text" : "password"}
                className="pr-20 font-mono text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowPasswords({ groq: false, gemini: false, openrouter: false })}>
            Hamısını Gizlət
          </Button>
          <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white">
            Yadda Saxla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface AIAssistantUIProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

export const AIAssistantUI: React.FC<AIAssistantUIProps> = ({
  messages,
  isLoading,
  onSendMessage,
  provider,
  onProviderChange
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('az-AZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleUpdateAPIKeys = (keys: { groq: string; gemini: string; openrouter: string }) => {
    // API keys updated notification or callback can be added here
  };

  return (
    <Card className="flex flex-col h-full border-none shadow-none bg-transparent relative">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Light mode decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/40 to-amber-300/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-bl from-amber-100/40 to-amber-200/40 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-gradient-to-tr from-amber-300/40 to-amber-400/40 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-gradient-to-tl from-amber-400/40 to-amber-500/40 rounded-full blur-2xl animate-pulse [animation-delay:3s]" />
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-gradient-to-r from-amber-200/40 to-amber-300/40 rounded-full blur-2xl animate-pulse [animation-delay:5s]" />
        
        {/* Additional light mode gradients */}
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-amber-100/30 via-amber-200/30 to-amber-300/30 rounded-full blur-3xl animate-pulse [animation-delay:6s]" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-tr from-amber-200/30 via-amber-300/30 to-amber-400/30 rounded-full blur-3xl animate-pulse [animation-delay:7s]" />
        
        {/* Floating icons with enhanced visibility */}
        <CakeIcon className="absolute top-1/4 right-[10%] w-8 h-8 text-amber-500/50 rotate-12 animate-float" />
        <HeartIcon className="absolute bottom-1/3 left-[15%] w-6 h-6 text-amber-400/50 -rotate-12 animate-float [animation-delay:2s]" />
        <CakeIcon className="absolute top-1/3 left-[8%] w-7 h-7 text-amber-600/50 rotate-45 animate-float [animation-delay:4s]" />
        <CloudIcon className="absolute top-[15%] left-[20%] w-8 h-8 text-amber-300/50 rotate-12 animate-float [animation-delay:1s]" />
        
        {/* Additional floating icons */}
        <StarIcon className="absolute top-[30%] left-[30%] w-5 h-5 text-amber-400/50 -rotate-45 animate-float [animation-delay:4.5s]" />
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-900/95 border-b dark:border-gray-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <SparklesIcon className="h-5 w-5 text-amber-500 dark:text-amber-400 animate-pulse" />
            <div className="absolute inset-0 h-5 w-5 text-amber-500 dark:text-amber-400 animate-ping opacity-20">
              <SparklesIcon />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">AI Köməkçi</h2>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Beta</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AIProviderSelector 
            currentProvider={provider}
            onSelect={onProviderChange}
          />
          <APIKeyDialog onUpdateKeys={handleUpdateAPIKeys} />
          <HelpDialog onSelectQuestion={setInputMessage} />
        </div>
      </div>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <div 
          ref={scrollAreaRef}
          className="h-full overflow-y-auto px-4 md:px-6 py-4 space-y-6 pb-36"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "group flex animate-in fade-in-50 slide-in-from-bottom-5 duration-300",
                message.role === 'user' 
                  ? "justify-end" 
                  : "justify-start"
              )}
            >
              <div
                className={cn(
                  "relative rounded-2xl p-4 shadow-md transition-all max-w-[60%] md:max-w-[50%]",
                  message.role === 'user' 
                    ? "bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white" 
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80",
                  message.role === 'user'
                    ? "rounded-br-sm" // Kullanıcı mesajları sağ alt köşesi sivri
                    : "rounded-bl-sm" // Asistan mesajları sol alt köşesi sivri
                )}
              >
                {message.isTyping ? (
                  <TypeWriter 
                    text={message.content}
                    className="whitespace-pre-line text-sm leading-relaxed"
                    onComplete={() => {
                      message.isTyping = false;
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                )}
                
                <div className={cn(
                  "flex items-center justify-between mt-2 text-xs",
                  message.role === 'user' 
                    ? "text-white/70" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  <span>{formatTime(message.timestamp)}</span>
                  
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300/20 dark:hover:bg-gray-600/20"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <ClipboardIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-sm font-medium">Cavab yazılır...</span>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-900/95 dark:border-gray-800">
          <div className="flex gap-2 items-center max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Sualınızı yazın..."
                disabled={isLoading}
                className="pr-24 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm focus-visible:ring-amber-500/20 dark:focus-visible:ring-amber-400/20 dark:text-gray-100 dark:placeholder-gray-400 rounded-full"
              />
            </div>
            <Button 
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 dark:from-amber-600 dark:to-amber-700 dark:hover:from-amber-700 dark:hover:to-amber-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-10px) rotate(var(--tw-rotate)); }
          100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
};