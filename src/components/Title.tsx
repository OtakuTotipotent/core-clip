interface TitleProps {
  title: string;
  heading: string;
  description: string;
}

export default function Title({ title, heading, description }: TitleProps) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <div className="text-sm uppercase tracking-[0.35em] text-pink-500 mb-4">
        {title}
      </div>
      <h2 className="text-3xl md:text-4xl font-semibold text-pink-500 mb-4">
        {heading}
      </h2>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
