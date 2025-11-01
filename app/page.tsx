import Image from "next/image";

interface LoginForm {
  name: string;
  email: string;
  password: number;
  id: string;
}

function LoginForm() {
  return;
}

export default function Login() {
  return (
    <div className="bg-gray-800 min-h-screen p-35">
      <div className="border border-gray-100 p-4 gap-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl text-center pb-4">Welcome To Our Platform</h1>
        <p className="text-gray-300 text-center pb-4">Login Or Register Here</p>
        <form className=""></form>
      </div>
    </div>
  )
}