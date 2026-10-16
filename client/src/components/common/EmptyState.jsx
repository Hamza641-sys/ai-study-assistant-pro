export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {Icon && (
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
