import { login } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const { message } = await searchParams
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto h-screen">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        <button
          formAction={login}
          className="bg-green-700 rounded-md px-4 py-2 text-white mb-2"
        >
          Sign In
        </button>
        {message && (
          <p className="mt-4 p-4 bg-neutral-900 text-center text-white">
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
