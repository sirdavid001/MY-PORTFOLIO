import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from './ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link to="/shop">
          <Button>
            <Home className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </Link>
      </div>
    </div>
  );
}
