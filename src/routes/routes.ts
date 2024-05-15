import { Router } from "express";
import authRoutes from "./auth.routes";
import productsRoutes from "./products.routes";
import userRoutes from "./users.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./orders.routes";

const rootRouter: Router = Router()

rootRouter.use('/auth', authRoutes)
rootRouter.use('/products', productsRoutes)
rootRouter.use('/users', userRoutes)
rootRouter.use('/cart', cartRoutes)
rootRouter.use('/orders', orderRoutes)

export default rootRouter;

