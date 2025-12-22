export const Spinner = ({ color = "text-primary" }: { color?: string }) => {
    return (
        <div className={`w-6 h-6 border-2 border-t-transparent border-${color} rounded-full animate-spin`}></div>
    );
};
