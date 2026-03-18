const Card = ({ children, className = '', hover = true }) => {
  const hoverClass = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  return (
    <div className={`card p-6 shadow-md bg-white rounded-2xl border border-gray-200 ${hoverClass} transition-all ${className}`}>
      {children}
    </div>
  );
};

export default Card;

