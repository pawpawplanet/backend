const { dataSource } = require('../db/data-source')

async function getRecommendations(req, res, next) {
    try {
        const serviceRepo = dataSource.getRepository('Service')
        const reviewRepo = dataSource.getRepository('Review')

        const query = serviceRepo
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.freelancer', 'freelancer')
            .leftJoinAndSelect('freelancer.user', 'freelancerUser')
            .where('service.enabled = true')

        const [rawServices] = await query.getManyAndCount()

        const serviceIds = rawServices.map(s => s.id)
        const reviews = await reviewRepo
            .createQueryBuilder('review')
            .leftJoin('review.order', 'order') // 重點：join 到 order 拿 service_id
            .select('order.service_id', 'service_id')
            .addSelect('AVG(review.rating)', 'avg_rating')
            .addSelect('COUNT(*)', 'count')
            .where('order.service_id IN (:...serviceIds)', { serviceIds }) // 改用 order.service_id
            .groupBy('order.service_id')
            .getRawMany()

        const reviewMap = {}
        reviews.forEach(r => {
            reviewMap[r.service_id] = {
                rating: parseFloat(r.avg_rating),
                review_count: parseInt(r.count),
            }
        })

        let services = rawServices.map(s => {
            const firstImage = s.images.length > 0 ? s.images?.split(',')[0] || null : ''
            return {
                id: s.id,
                freelancer_name: s.freelancer.user.name,
                description: s.description,
                service_type_id: s.service_type_id,
                price: s.price,
                price_unit: s.price_unit,
                image: firstImage,
                rating: reviewMap[s.id]?.rating || 0,
            }
        })

        // services = services.filter((item) => item.rating >= 4.5)

        let result = [];
        if (services.length > 10) {
            // 隨機取 10 筆
            const copy = [...services];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            result = copy.slice(0, 10);
        } else {
            // 不足 10 筆就全放進去
            result = services;
        }
        res.status(200).json({
            message: '成功',
            status: 'success',
            data: {
                services: result,
            }
        })





    } catch (error){
        console.error('查詢服務失敗:', error)
        next(error)
    }
}

module.exports = {
    getRecommendations
}
