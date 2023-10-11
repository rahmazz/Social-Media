export class ApiFeatures{
    constructor(mongooseQuery,queryData){
        this.mongooseQuery = mongooseQuery
        this.queryData = queryData
    }
    pagination = (model) => {
        let page = this.queryData.page
        let size = this.queryData.size
        if (page <= 0 || !page) page = 1;
        if (size <= 0 || !size) size = 10;
        const skip = size * (page - 1);
        this.mongooseQuery.skip(skip).limit(size)
        model.countDocuments().then((modelCounts)=>{
        this.queryData.totalPages = Math.ceil(modelCounts / size) || 1;
        if (this.queryData.totalPages > page) {
            this.queryData.nextPage = Number( page) + 1
        }
        if (page > 1) {
            this.queryData.previousPage = Number(page) - 1
        }
        this.queryData.modelCounts = modelCounts
        });
        return this
    }

    filter = () =>{
        const excluded = ["sort", "page", "size", "fields", "searchKey"];
        let queryFields = { ...this.queryData };
        excluded.forEach((ele) => {
            delete queryFields[ele];
        });
        queryFields = JSON.parse(JSON.stringify(queryFields).replace(
            /gt|gte|lte|lt/g,
            (match) => `$${match}`
        ))
        this.mongooseQuery.find(queryFields)
        return this
    }

    sort = () =>{
        this.mongooseQuery.sort(this.queryData.sort?.replace(/,/g, ' '));
        return this
    }

    search = () =>{
        if (this.queryData.searchKey) {
            this.mongooseQuery.find({
                $or: [
                    { name: { $regex: this.queryData.searchKey } },
                    { description: { $regex: this.queryData.searchKey } },
                ]
            });  
        }
        return this
    }

    select = () =>{
        this.mongooseQuery.select(this.queryData.fields?.replace(/,/g, ' '));
        return this
    }
}

