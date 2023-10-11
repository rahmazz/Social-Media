import mongoose, { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        required:[true , 'username is required'],
        min:[3,'minimum lenght is 3 char'],
        max:[15,'maximum lenght is 10 char'],
    },
    firstName:{
        type:String,
        min:[3,'minimum lenght is 3 char'],
        max:[15,'maximum lenght is 10 char'],
    },
    lastName:{
        type:String,
        min:[3,'minimum lenght is 3 char'],
        max:[15,'maximum lenght is 10 char'],
    },
    email:{
        type:String,
        required:[true , 'email is required'],
        unique:[true , 'email must be unique'],
        lowercase:true,
    },
    confirmEmail:{
        type:Boolean,
        default:false,
    },
    password:{
        type:String,
        required:[true , 'password is required']
    },
    phone:{
        type:String,
        required:[true , 'phone is required']
    },
    role:{
        type:String,
        default:'User',
        enum: ["User", "Admin"],
    },
    age: {
        type: Number,
    },
    profileImage:{
        type:Object,
        public_id:{type:String},
        secure_url:{type:String}
    },
    coverImages:{
        type:Array,
        public_id:{type:String},
        secure_url:{type:String}
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    code:{
        type:String,
        min:[6,'code lenght must be 6 char'],
        max:[6,'code lenght must be 6 char'],
    },
    codeExpirationTime:{
        type:Date
    },
    video:{
        type:Object,
        public_id:{type:String},
        secure_url:{type:String}
    }
}, 
{
    timestamps:true
}
)

// when saving document in database this hook will execute and split the name

userSchema.pre('save', function(next) {
    const name = this.name;
    if (name) {
      const [firstName, lastName] = name.split(' ');
      this.firstName = firstName;
      this.lastName = lastName;
    }
    next();
  });
  
  
  


const userModel = mongoose.models.User|| model("User",userSchema)


export default userModel