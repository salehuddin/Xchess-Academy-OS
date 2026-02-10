import { Head, Link } from '@inertiajs/react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Card,
  CardHeader,
  CardBody
} from "@heroui/react";

export default function Welcome({ auth }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Head title="Welcome" />
      
      {/* Navbar */}
      <Navbar maxWidth="xl" position="static" className="bg-background/70 backdrop-blur-md border-b border-divider">
        <NavbarBrand>
          <p className="font-bold text-inherit text-2xl tracking-tighter">XCHESS ACADEMY</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          {auth.user ? (
            <NavbarItem>
              <Button as={Link} href={route('dashboard')} color="primary" variant="flat">
                Dashboard
              </Button>
            </NavbarItem>
          ) : (
            <>
              <NavbarItem>
                <Button as={Link} href={route('login')} variant="light">
                  Log in
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button as={Link} href={route('register')} color="primary" variant="solid">
                  Sign Up
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <main className="flex-grow">
          {/* Hero Section */}
          <section className="py-20 px-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 pb-2 leading-tight">
                Master the Game of Kings
              </h1>
              <p className="text-xl md:text-2xl text-default-600 max-w-2xl mx-auto">
                Join XChess Academy to elevate your chess skills with expert coaching, 
                structured lessons, and a vibrant community.
              </p>
              <div className="flex justify-center gap-4 pt-8">
                 {!auth.user && (
                    <Button as={Link} href={route('register')} size="lg" color="primary" className="font-semibold shadow-lg shadow-primary/40">
                        Get Started
                    </Button>
                 )}
                 <Button as={Link} href="#" size="lg" variant="bordered">
                    Learn More
                 </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                <Card className="p-4 border-none shadow-md hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <p className="text-tiny uppercase font-bold text-primary">Expert Coaching</p>
                        <h4 className="font-bold text-large mt-1">Grandmaster Lessons</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <p className="text-default-500">Learn from the best with our structured curriculum designed for all skill levels.</p>
                    </CardBody>
                </Card>
                <Card className="p-4 border-none shadow-md hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <p className="text-tiny uppercase font-bold text-secondary">Tournaments</p>
                        <h4 className="font-bold text-large mt-1">Weekly Competitions</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <p className="text-default-500">Test your skills in our regular tournaments and climb the academy rankings.</p>
                    </CardBody>
                </Card>
                <Card className="p-4 border-none shadow-md hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <p className="text-tiny uppercase font-bold text-success">Community</p>
                        <h4 className="font-bold text-large mt-1">Vibrant Community</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <p className="text-default-500">Connect with fellow chess enthusiasts, analyze games, and grow together.</p>
                    </CardBody>
                </Card>
            </div>
          </section>
      </main>
      
      <footer className="py-10 text-center text-default-400 text-sm border-t border-divider">
        &copy; {new Date().getFullYear()} XChess Academy. All rights reserved.
      </footer>
    </div>
  );
}
