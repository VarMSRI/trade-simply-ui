
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
}

const MarketNews: React.FC = () => {
  // This would come from your API in a real application
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Fed Signals Potential Rate Cut in September as Inflation Cools',
      source: 'Financial Times',
      time: '2 hours ago',
      url: '#',
    },
    {
      id: '2',
      title: 'Tech Giants Report Strong Q2 Earnings, Exceeding Analyst Expectations',
      source: 'Wall Street Journal',
      time: '4 hours ago',
      url: '#',
    },
    {
      id: '3',
      title: 'Oil Prices Surge on Middle East Tensions and Supply Concerns',
      source: 'Bloomberg',
      time: '5 hours ago',
      url: '#',
    },
    {
      id: '4',
      title: 'Global Markets Rally on Positive Economic Data from China',
      source: 'CNBC',
      time: '8 hours ago',
      url: '#',
    },
    {
      id: '5',
      title: 'Retail Sector Shows Signs of Recovery with Strong Consumer Spending',
      source: 'Reuters',
      time: '10 hours ago',
      url: '#',
    },
  ];

  return (
    <Card className="col-span-2 h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Newspaper className="h-5 w-5 text-primary" />
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsItems.map((item) => (
            <a 
              key={item.id} 
              href={item.url} 
              className="block group"
            >
              <div className="transition-colors rounded-md p-2 -mx-2 hover:bg-muted">
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{item.source}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketNews;
