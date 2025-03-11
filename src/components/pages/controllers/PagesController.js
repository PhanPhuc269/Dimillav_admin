class PagesController{
    tracking(req,res,next){
        res.render('tracking');
    }
    elements(req,res,next){
        res.render('elements');
    }
    
}

module.exports = new PagesController();