import { Request, Response } from 'express';
import { NotFoundException } from '../exceptions/not-found';
import { ErrorCode } from '../exceptions/root';
import { Product } from '@prisma/client';
import { prismaClient } from '..';
import { ChangeQuantitySchema, CreateCartSchema } from '../schema/cart';


export const addItemToCart =async (req: Request, res: Response) => {
    const validatedData = CreateCartSchema.parse(req.body)
    let product: Product;
    try {
        product = await prismaClient.product.findFirstOrThrow({
            where: {
                id: validatedData.productId
            }
        })
    } catch(err) {
        throw new NotFoundException('Product not found!', ErrorCode.PRODUCT_NOT_FOUND)
    }
    const cart = await prismaClient.cartItem.create({
        data: {
            userId: req.user.id,
            productId: product.id,
            quantity: validatedData.quantity
        }
    })
    res.json({
        cart: cart
    })
}

export const getCart =async (req: Request, res: Response) => {
    const cart = await prismaClient.cartItem.findMany({
        where: {
            userId: req.user.id
        },
        include:{
            product: true
        }
    })
    res.json({
        cart: cart
    })
}

export const deleteItemFromCart =async (req: Request, res: Response) => {
    await prismaClient.cartItem.delete({
        where:{
            id: +req.params.id
        }
    })
    res.json({
        status: 'success'
    })
}

export const changeQuantity =async (req: Request, res: Response) => {
    const validatedData = ChangeQuantitySchema.parse(req.body)
    const updatedCart = await prismaClient.cartItem.update({
        where: {
            id: +req.params.id
        },
        data: {
            quantity: validatedData.quantity
        }
    })

    res.json({
        cart: updatedCart
    })
}