import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const included = [
  "Full lead generation system set up for your business",
  "Paid ads campaign live and running within the first week",
  "Daily performance tracking so you see results in real time",
  "Direct access to your account manager throughout",
];

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-14 md:py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Ready to grow?</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Ready to start getting qualified leads?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Send us a message and we'll get your full lead generation system up and running. No retainers, no long-term contracts - you only pay for the leads we deliver.
          </p>

          <ul className="inline-flex flex-col items-start gap-3 mb-8 text-sm text-muted-foreground">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-deep shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>

          <div>
            <Button
              variant="hero"
              size="lg"
              className="rounded-full text-base px-10 py-6 font-bold w-full sm:w-auto"
              onClick={() => navigate('/contact', { state: { scrollToForm: true } })}
              aria-label="Get started with Markety"
            >
              Get started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
