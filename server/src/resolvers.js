const { GraphQLScalarType } = require("graphql");
const moment = require("moment");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const ObjectId = mongoose.Types.ObjectId;
const { User, Team, Folder, Group } = require("./models");
const JWT_SECRET = process.env.JWT_SECRET;
const { getUserId } = require("./utils");
const { projectStatuses, avatarColors } = require("./settings");

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

const nodeMailer = require("nodemailer");
const { welcomeEmail } = require("./emails");
const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.GMAIL_PASSWORD
  }
});

async function deleteSubfolders(id) {
  const folders = await Folder.find({ parent: id });
  for (const folder of folders) {
    await deleteSubfolders(folder.id);
    await Folder.deleteOne({ _id: folder.id });
  }
}

const resolvers = {
  Query: {
    async getTeam(_, args, context) {
      const userId = getUserId(context);
      const user = await User.findById(userId);
      return await Team.findById(user.team);
    },
    async getFolders(_, { parent }, context) {
      const userId = getUserId(context);
      if (parent) {
        return await Folder.find({ parent });
      } else {
        const user = await User.findById(userId);
        const groups = await Group.find({ users: ObjectId(userId) }, "_id");
        const ids = groups
          .map(o => o._id)
          .concat(
            ["External User", "Collaborator"].includes(user.role)
              ? [ObjectId(userId)]
              : [ObjectId(userId), user.team]
          );
        return await Folder.find({ "shareWith.item": ids }).populate(
          "shareWith"
        );
      }
    },
    async getFolder(_, { id }, context) {
      const userId = getUserId(context);
      return await Folder.findById(id).populate("shareWith");
    },
    async searchFolders(_, { text }, context) {
      const userId = getUserId(context);
      return await Folder.find({ $text: { $search: text } }).limit(20).populate("shareWith");
    },
    async getUserById(_, { id }, context) {
      const userId = getUserId(context);
      return await User.findById(id);
    },
    async getFolderTeams(_, { id }, context) {
      const userId = getUserId(context);
      const folder = await Folder.findById(id).populate("shareWith");
      if(folder.shareWith == null){
        return [];
      }
      const teams = folder.shareWith.filter(x => x.kind === "Team");
      return await teams.map(x => Team.findById(x.item));
    },
    getStatuses(_, { }, context) {
      const userId = getUserId(context);
      return projectStatuses;
    }
  },
  Mutation: {
    async captureEmail(_, { email }) {
      const isEmailTaken = await User.findOne({ email });
      if (isEmailTaken) {
        throw new Error("This email is already taken");
      }
      const user = await User.create({
        email,
        role: "Owner",
        status: "Pending"
      });
      //send emails
      //transporter.sendMail(welcomeEmail(email, user))
      console.log(welcomeEmail(email, user));
      return user;
    },
    async signup(_, { id, firstname, lastname, password }) {
      const user = await User.findById(id);
      if (user.status === "Active") {
        throw new Error("This user is already active");
      }
      const common = {
        firstname,
        lastname,
        name: `${firstname} ${lastname}`,
        avatarColor: randomChoice(avatarColors),
        password: await bcrypt.hash(password, 10),
        status: "Active"
      };
      if (user.role === "Owner") {
        const team = await Team.create({
          name: `${common.name}'s Team`
        });
        user.set({
          ...common,
          team: team.id,
          jobTitle: "CEO/Owner/Founder"
        });
      } else {
        user.set(common);
      }
      await user.save();
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      return { token, user };
    },
    async login(_, { email, password }) {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("No user with that email");
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Incorrect password");
      }
      const token = jwt.sign({ id: user.id, email }, JWT_SECRET);
      return { token, user };
    },
    async createFolder(_, { parent, name, description }, context) {
      const userId = getUserId(context);

      if (name === "") {
        throw new Error("Name cannot be empty.");
      }

      const folder = await Folder.create({
        name,
        parent: parent || undefined,
        description,
        shareWith: parent
          ? []
          : [
            {
              kind: "Team",
              item: (await User.findById(userId)).team
            }
          ],
        startDate: moment().startOf("day").toDate(),
        endDate: moment().startOf("day").add(1, 'week').toDate(),
        status: projectStatuses[0],
        createdBy: userId
      });
      return await Folder.findById(folder.id).populate("shareWith.item");
    },
    async updateFolder(_, { id, input }, context) {
      const userId = getUserId(context);

      //validate name
      if ('name' in input) {
        if (input.name === "") {
          throw new Error("Name cannot be empty.");
        }
      }

      //validate dates
      if ('startDate' in input && !('endDate' in input)) {
        throw new Error("Date validation failed.");
      }
      if (!('startDate' in input) && 'endDate' in input) {
        throw new Error("Date validation failed.");
      }
      if ('startDate' in input && 'endDate' in input) {
        const startDate = moment(input.startDate).startOf("day");
        const endDate = moment(input.endDate).startOf("day");
        if (!startDate.isBefore(endDate)) {
          throw new Error("Date validation failed.");
        }
      }

      const updatedFolder = await Folder.findOneAndUpdate(
        { _id: id },
        { $set: input },
        { new: true }
      ).populate("shareWith");
      await Folder.syncIndexes();
      return updatedFolder;
    },
    async deleteFolder(_, { id }, context) {
      const userId = getUserId(context);
      await Folder.deleteOne({ _id: id });
      await Folder.syncIndexes();
      deleteSubfolders(id);
      return true;
    }
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue: value => moment(value).toDate(), // value from the client
    serialize: value => value.getTime(), // value sent to the client
    parseLiteral: ast => ast
  })
};
module.exports = resolvers;
