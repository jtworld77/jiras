'use client';

interface DeleteButtonProps {
  action: () => Promise<void>;
}

export function DeleteButton({ action }: DeleteButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-red-500 hover:text-red-700 text-sm"
        onClick={(e) => {
          if (!confirm('Are you sure?')) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}
