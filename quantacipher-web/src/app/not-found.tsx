import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center justify-center px-4 py-24 text-center">
            <div className="w-16 h-16 bg-[#f8f9fa] border border-[#dadce0] rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-[#5f6368]" />
            </div>
            
            <h1 className="text-[32px] sm:text-[40px] font-medium text-[#202124] mb-4 tracking-tight">
                Page Under Construction
            </h1>
            
            <p className="text-[16px] sm:text-[18px] text-[#5f6368] max-w-md mx-auto mb-10 leading-relaxed">
                This section of the QuantaCipher platform is currently in development and will be available in the next release.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                    <Button className="w-full sm:w-auto bg-[#1a73e8] hover:bg-[#1967d2] text-white rounded-[6px] h-[44px] px-6 font-medium shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Homepage
                    </Button>
                </Link>
                <Link href="/documentation">
                    <Button variant="outline" className="w-full sm:w-auto bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa] rounded-[6px] h-[44px] px-6 font-medium transition-all">
                        Read Documentation
                    </Button>
                </Link>
            </div>
        </div>
    );
}
