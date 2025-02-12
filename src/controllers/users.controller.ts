import { Request, Response} from 'express'
import { prismaClient } from '..'
import { NotFoundException } from '../exceptions/not-found'
import { ErrorCode } from '../exceptions/root'
import { Address } from '@prisma/client'
import { BadRequestsException } from '../exceptions/bad-requests'
import { AddressSchema, UpdateUserSchema } from '../schema/user'

export const addAddress = async(req: Request, res: Response) => {
    AddressSchema.parse(req.body)

    const address = await prismaClient.address.create({
        data:{
            ...req.body,
            userId: req.user.id
        }
    })
    res.json(address)
}

export const listAddress = async(req: Request, res: Response) => {
    const addresses = await prismaClient.address.findMany({
        where: {
            userId: req.user.id
        }
    })
    res.json({
        status: 'success',
        address: addresses
    })
}

export const deleteAddress = async(req: Request, res: Response) => {
    
    try {
        await prismaClient.address.delete({
            where:{
                id: +req.params.id
            }
        })
        res.json({
            status: 'success',
            msg: `Success delete address.`
        })

    } catch(err) {
        throw new NotFoundException('Address not found.', ErrorCode.ADDRESS_NOT_FOUND)
    }
}

export const updateUser = async(req: Request, res: Response) => {
    const validatedData = UpdateUserSchema.parse(req.body)
    let shippingAddress: Address;
    let billingAddress: Address;
    console.log(validatedData)
    if(validatedData.defaultShippingAddress) {
        try {
            shippingAddress = await prismaClient.address.findFirstOrThrow({
                where: {
                    id: validatedData.defaultShippingAddress
                }
            })
        } catch(error) {
            throw new NotFoundException('Address not found.', ErrorCode.ADDRESS_NOT_FOUND)
        }
        if(shippingAddress.userId != req.user.id) {
            throw new BadRequestsException('Address does not belong to user', ErrorCode.ADDRESS_DOES_NOT_BELONG)
        }
    }
    if(validatedData.defaultBillingAddress) {
        try {
            billingAddress = await prismaClient.address.findFirstOrThrow({
                where: {
                    id: validatedData.defaultBillingAddress
                }
            })
            
        } catch(error) {
            throw new NotFoundException('Address not found.', ErrorCode.ADDRESS_NOT_FOUND)
        }
        if(billingAddress.userId != req.user.id) {
            throw new BadRequestsException('Address does not belong to user', ErrorCode.ADDRESS_DOES_NOT_BELONG)
        }
    }

    const updatedUser = await prismaClient.user.update({
        where:{
            id: req.user.id
        },
        data: validatedData
    })
    res.json(updatedUser)
    

}

export const listUsers = async(req: Request, res: Response) => {
    const users = await prismaClient.user.findMany({
        skip: +req.query.skip || 0,
        take: 5
    })
    res.json(users)
    
}

export const getUserById = async(req: Request, res: Response) => {
    try {
        const user = await prismaClient.user.findFirstOrThrow({
            where: {
                id: +req.params.id
            },
            include: {
                addresses: true
            }
        })
        res.json(user)

    } catch(err) {
        throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND)
    }

}

export const changeUserRole = async(req: Request, res: Response) => { 
    // Validation 
    try {
        const user = await prismaClient.user.update({
            where: {
                id: +req.params.id
            }, 
            data: {
                role: req.body.role
            }
        })
        res.json(user)

    } catch(err) {
        throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND)
    }
}
