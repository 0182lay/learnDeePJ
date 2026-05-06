import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, QrCode, Smartphone, Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  price: number;
  onPaymentSuccess: (method: string) => void;
}

const METHODS = [
  { id: "qr", label: "QR Code / PromptPay", icon: QrCode, desc: "ສະແກນ QR ຊຳລະ" },
  { id: "card", label: "ບັດເຄຣດິດ / ເດບິດ", icon: CreditCard, desc: "Visa, Mastercard" },
  { id: "mobile", label: "Mobile Banking", icon: Smartphone, desc: "BCEL One, JDB" },
];

const PaymentDialog = ({ open, onOpenChange, courseTitle, price, onPaymentSuccess }: PaymentDialogProps) => {
  const [step, setStep] = useState<"select" | "processing" | "success">("select");
  const [selectedMethod, setSelectedMethod] = useState("");

  const handlePay = (method: string) => {
    setSelectedMethod(method);
    setStep("processing");
    // Simulate payment processing
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const handleClose = () => {
    if (step === "success") {
      onPaymentSuccess(selectedMethod);
    }
    setStep("select");
    setSelectedMethod("");
    onOpenChange(false);
  };

  const commissionRate = 0.2;
  const commission = price * commissionRate;
  const teacherEarning = price - commission;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {step === "success" ? "ຊຳລະເງິນສຳເລັດ!" : "ຊຳລະເງິນ"}
          </DialogTitle>
          <DialogDescription>{courseTitle}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Price summary */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ລາຄາຄອສ</span>
                  <span className="font-bold text-lg text-secondary">₭{price.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>ຄ່າຄອມມິດຊັ່ນລະບົບ (20%)</span>
                    <span>₭{commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ຜູ້ສອນໄດ້ຮັບ</span>
                    <span className="text-accent font-medium">₭{teacherEarning.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <div className="space-y-2">
                <p className="text-sm font-medium">ເລືອກວິທີຊຳລະ:</p>
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handlePay(m.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 hover:border-secondary transition-all text-left"
                  >
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <m.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center space-y-4"
            >
              {selectedMethod === "qr" ? (
                <>
                  {/* Mock QR Code */}
                  <div className="mx-auto w-48 h-48 bg-foreground rounded-xl flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-1 p-4">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-5 h-5 rounded-sm ${Math.random() > 0.4 ? "bg-background" : "bg-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">ສະແກນ QR Code ເພື່ອຊຳລະ</p>
                  <div className="flex items-center justify-center gap-2 text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">ກຳລັງລໍຖ້າການຊຳລະ...</span>
                  </div>
                </>
              ) : (
                <>
                  <Loader2 className="h-12 w-12 mx-auto text-secondary animate-spin" />
                  <p className="text-sm text-muted-foreground">ກຳລັງດຳເນີນການ...</p>
                </>
              )}
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center"
              >
                <CheckCircle className="h-10 w-10 text-accent" />
              </motion.div>
              <h3 className="font-heading font-bold text-lg">ຊຳລະເງິນສຳເລັດ!</h3>
              <p className="text-sm text-muted-foreground">
                ທ່ານສາມາດເຂົ້າຮຽນຄອສ "{courseTitle}" ໄດ້ແລ້ວ
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>ຈຳນວນ: <strong className="text-foreground">₭{price.toLocaleString()}</strong></p>
                <p>ວິທີ: <Badge variant="outline" className="text-xs">{METHODS.find((m) => m.id === selectedMethod)?.label}</Badge></p>
              </div>
              <Button onClick={handleClose} className="mt-4">
                ເລີ່ມຮຽນເລີຍ!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
