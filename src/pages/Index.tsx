
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-4xl font-bold mb-4 text-primary">TradeSimply</div>
        <p className="text-xl text-muted-foreground">Loading your trading dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
