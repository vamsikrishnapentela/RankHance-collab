const Container = ({ children, className = '' }) => (
  <div className={`max-w-5xl mx-auto w-full ${className}`}>
    {children}
  </div>
);

export default Container;

