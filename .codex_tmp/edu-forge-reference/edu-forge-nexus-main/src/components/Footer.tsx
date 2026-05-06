import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold">LearnLao</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ແພລດຟອມການຮຽນອອນລາຍ ອັນດັບ 1 ຂອງລາວ
          </p>
        </div>
        {[
          { title: "ຄອສຮຽນ", links: ["ທັງໝົດ", "ຍອດນິຍົມ", "ໃໝ່ລ່າສຸດ", "ຟຣີ"] },
          { title: "ກ່ຽວກັບ", links: ["ກ່ຽວກັບເຮົາ", "ຕິດຕໍ່", "ນະໂຍບາຍ", "ເງື່ອນໄຂ"] },
          { title: "ສະໜັບສະໜູນ", links: ["ຊ່ວຍເຫຼືອ", "FAQ", "ເປັນຜູ້ສອນ", "ຮ່ວມງານ"] },
        ].map((section) => (
          <div key={section.title} className="space-y-3">
            <h4 className="font-heading font-semibold text-sm">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link}>
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
        © 2026 LearnLao. ສະຫງວນລິຂະສິດ.
      </div>
    </div>
  </footer>
);

export default Footer;
