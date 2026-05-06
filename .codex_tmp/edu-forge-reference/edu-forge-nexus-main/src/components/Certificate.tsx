import { motion } from "framer-motion";
import { Award, Download, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateProps {
  studentName: string;
  courseName: string;
  instructor: string;
  date: string;
  onClose: () => void;
}

const Certificate = ({ studentName, courseName, instructor, date, onClose }: CertificateProps) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-auto max-w-2xl aspect-[1.414] rounded-2xl overflow-hidden"
      >
        {/* Certificate background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(40_80%_55%/0.15),transparent_60%)]" />
        
        {/* Border */}
        <div className="absolute inset-3 border-2 border-secondary/30 rounded-xl" />
        <div className="absolute inset-5 border border-secondary/15 rounded-lg" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8 md:p-12 text-center text-primary-foreground">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-secondary" />
            </div>
            <span className="font-heading text-lg font-bold">LearnLao</span>
          </div>

          {/* Title */}
          <div className="mb-6">
            <Award className="h-10 w-10 text-secondary mx-auto mb-2" />
            <h2 className="font-heading text-xl md:text-2xl font-bold text-secondary tracking-wider uppercase">
              ໃບຢັ້ງຢືນ
            </h2>
            <p className="text-primary-foreground/50 text-xs mt-1 tracking-widest uppercase">
              Certificate of Completion
            </p>
          </div>

          <p className="text-primary-foreground/70 text-sm mb-2">ຢັ້ງຢືນວ່າ</p>
          
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-4 border-b border-secondary/30 pb-2 px-6">
            {studentName}
          </h1>

          <p className="text-primary-foreground/70 text-sm mb-2">ໄດ້ສຳເລັດຄອສຮຽນ</p>

          <h3 className="font-heading text-lg md:text-xl font-semibold mb-6">
            "{courseName}"
          </h3>

          <div className="flex items-center gap-8 text-xs text-primary-foreground/50 mt-auto">
            <div className="text-center">
              <p className="border-t border-primary-foreground/20 pt-2 px-4">{instructor}</p>
              <p>ຜູ້ສອນ</p>
            </div>
            <div className="text-center">
              <p className="border-t border-primary-foreground/20 pt-2 px-4">{date}</p>
              <p>ວັນທີ</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onClose}>ປິດ</Button>
        <Button>
          <Download className="h-4 w-4 mr-1" /> ດາວໂຫຼດ PDF
        </Button>
      </div>
    </div>
  );
};

export default Certificate;
