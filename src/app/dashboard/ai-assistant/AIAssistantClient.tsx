'use client';

import React, { useState, useEffect } from 'react';
import { AIAssistantUI } from '@/components/ai-assistant/ui/AIAssistantUI';
import { AIPromptManager } from '@/lib/ai-assistant/AIPromptManager';
import { Message, DateRange, AIProvider } from '@/types/ai-assistant';
import { toast } from 'sonner';

const API_KEYS = {
  groq: process.env.NEXT_PUBLIC_GROQ_API_KEY || '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',
  openrouter: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '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',
  gemini: process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyC26TIDS26c5rve0bM2OQkkxEdoWNUtNhg'
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://aidas-corners-springboot-production.up.railway.app/api';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default function AIAssistantClient() {
  const [provider, setProvider] = useState<AIProvider>('groq');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // İlk mesajı ekle
    const initialMessage: Message = {
      role: 'assistant',
      content: 'Salam! Mən Aida\'s Corner\'in AI köməkçisiyəm. Sizə satış təhlili və statistika mövzusunda kömək edə bilərəm.\n\nSuallarınızı aşağıdakı kateqoriyalarda verə bilərsiniz:\n\n• Sadə Suallar (Məs: "Neçə filial var?")\n• Orta Səviyyəli Suallar (Məs: "San Sebastian tortunun ümumi satışı nə qədərdir?")\n• Çətin Suallar (Məs: "Ən yüksək satışı olan 3 məhsulu tapın")\n\nDaha ətraflı məlumat üçün sağ yuxarıdakı sual işarəsinə klikləyin.',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages([initialMessage]);

    // AI Prompt Manager'ı başlat
    const initAI = async () => {
      try {
        const promptManager = AIPromptManager.getInstance();
        await promptManager.initializeBranches();
      } catch (error) {
        console.error('AI başlatma hatası:', error);
      }
    };

    initAI();

    // Kullanıcı tercihini yükle
    const loadPreferences = async () => {
      try {
        const savedProvider = localStorage.getItem('ai_provider') as AIProvider;
        if (savedProvider) {
          setProvider(savedProvider);
        }
      } catch (error) {
        console.error('Tercihler yüklenirken hata:', error);
      }
    };

    loadPreferences();
  }, []);

  const handleProviderChange = async (newProvider: AIProvider) => {
    try {
      localStorage.setItem('ai_provider', newProvider);
      setProvider(newProvider);
    } catch (error) {
      console.error('Provider değiştirilirken hata:', error);
    }
  };

  const getAIResponse = async (prompt: string): Promise<string> => {
    try {
      switch (provider) {
        case 'groq':
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEYS.groq}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'mixtral-8x7b-32768',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 2048,
            })
          });

          if (!groqResponse.ok) {
            throw new Error('Groq API yanıtı alınamadı');
          }

          const groqData = await groqResponse.json();
          return groqData.choices[0]?.message?.content || '';

        case 'gemini':
          const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': API_KEYS.gemini
            },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
              }
            })
          });

          if (!geminiResponse.ok) {
            throw new Error('Gemini API yanıtı alınamadı');
          }

          const geminiData = await geminiResponse.json();
          return geminiData.candidates[0]?.content?.parts[0]?.text || '';

        case 'openrouter':
          const openrouterResponse = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEYS.openrouter}`,
              'HTTP-Referer': 'https://aidascorner.com',
              'X-Title': 'Aidas Corner AI Assistant',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'deepseek/deepseek-r1:free',
              messages: [{ role: 'user', content: prompt }]
            })
          });

          if (!openrouterResponse.ok) {
            throw new Error('OpenRouter API yanıtı alınamadı');
          }

          const openrouterData = await openrouterResponse.json();
          return openrouterData.choices[0]?.message?.content || '';
          
        default:
          throw new Error('Bilinməyən AI təchizatçısı');
      }
    } catch (error) {
      console.error('AI yanıtı alınırken xəta:', error);
      throw error;
    }
  };

  const handleSend = async (inputMessage: string) => {
    console.log('\n=== USER INTERACTION LOGS ===');
    console.log('Kullanıcı Mesajı:', inputMessage);
    console.log('AI Provider:', provider);

    const userMessage: Message = { 
      role: 'user', 
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const dateRange = extractDateRange(inputMessage);
      console.log('Çıkarılan Tarih Aralığı:', dateRange);

      const response = await fetch(
        `${API_BASE_URL}/orders?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      
      if (!response.ok) {
        throw new Error('API yanıtı alınamadı');
      }

      const apiResponse = await response.json();
      const promptManager = AIPromptManager.getInstance();
      const context = promptManager.createContext(apiResponse);
      const prompt = promptManager.createPrompt(context, inputMessage, dateRange);

      const text = await getAIResponse(prompt);
      console.log('AI Yanıtı:', text);

      if (!text || text === 'undefined') {
        throw new Error('AI yanıtı boş veya geçersiz');
      }

      const isValid = promptManager.validateResponse(text, apiResponse);
      if (!isValid) {
        throw new Error('AI yanıtı doğrulama kontrolünden geçemedi');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: text.trim(),
        timestamp: new Date(),
        isTyping: true
      };
      
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('İşlem Hatası:', error);
      toast.error('Bağışlayın, bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Bağışlayın, bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Yardımcı fonksiyonlar
  const extractDateRange = (message: string): DateRange => {
    // Tarih aralığı formatı: DD.MM.YYYY - DD.MM.YYYY
    const dateRangeMatch = message.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2})\.(\d{2})\.(\d{4})/);
    
    if (dateRangeMatch) {
      const [_, startDay, startMonth, startYear, endDay, endMonth, endYear] = dateRangeMatch;
      console.log('Tarih aralığı bulundu:', {
        start: `${startDay}.${startMonth}.${startYear}`,
        end: `${endDay}.${endMonth}.${endYear}`
      });
      
      return {
        startDate: `${startYear}-${startMonth}-${startDay}`,
        endDate: `${endYear}-${endMonth}-${endDay}`
      };
    }

    // Tek tarih formatı: DD.MM.YYYY
    const singleDateMatch = message.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (singleDateMatch) {
      const [_, day, month, year] = singleDateMatch;
      console.log('Tek tarih bulundu:', `${day}.${month}.${year}`);
      
      return {
        startDate: `${year}-${month}-${day}`,
        endDate: `${year}-${month}-${day}`
      };
    }

    // Tarih bulunamadıysa son 30 günü al
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    console.log('Varsayılan tarih aralığı:', {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  return (
    <div className="h-full">
      <AIAssistantUI
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSend}
        provider={provider}
        onProviderChange={handleProviderChange}
      />
    </div>
  );
} 