import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center justify-center px-4 py-24 text-center">
            <div className="w-16 h-16 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-[#6b7280]" />
            </div>
            
            <h1 className="text-[32px] sm:text-[40px] font-medium text-[black] mb-4 tracking-tight">
                Page Under Construction
            </h1>
            
            <p className="text-[16px] sm:text-[18px] text-[#6b7280] max-w-md mx-auto mb-10 leading-relaxed">
                This section of the QuantaCipher platform is currently in development and will be available in the next release.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                    <Button className="w-full sm:w-auto bg-[#C4ED5F] hover:bg-[black] text-white rounded-lg h-[44px] px-6 font-medium shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Homepage
                    </Button>
                </Link>
                <Link href="/documentation">
                    <Button variant="outline" className="w-full sm:w-auto bg-white border-[#e5e7eb] text-[#1f2937] hover:bg-white rounded-lg h-[44px] px-6 font-medium transition-all">
                        Read Documentation
                    </Button>
                </Link>
            </div>
        </div>
    );
}
