interface FeatureCardProps {
    title: string;
    description: string;
  }
  
  const FeatureCard = ({ title, description }: FeatureCardProps) => (
    <div className="p-6 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
  
  export default FeatureCard;