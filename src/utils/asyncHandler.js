const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch( (err) => next(err))
    }
}


export {asyncHandler}


























// const ayncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//                 succesa: false,
//                 message: err.message || 'Server Error'
//         })
//     }
// }


