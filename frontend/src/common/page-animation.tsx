import { AnimatePresence, motion } from "framer-motion";
import type {ReactNode} from "react";
interface AnimationWrapperProps {
    children: ReactNode;
    initial?: Record<string, any>;
    animate?: Record<string, any>;
    transition?: Record<string, any>;
    className?: string;
}

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
    children,
 initial = { opacity: 0 },
animate = { opacity: 1 },
transition = { duration: 1 },
 className}) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={initial}
                animate={animate}
                transition={transition}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default AnimationWrapper;